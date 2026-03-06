import { NextRequest, NextResponse } from "next/server";
import { analyseRepo, generateLessonPlan } from "../../../../githuburl/index";
import type {
  AnalyseErrorResponse,
  AnalyseSuccessResponse,
  RepoMetaSummary,
  QualitySignal,
} from "./types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const VALID_TARGET_ROLES = [
  "SOFTWARE_ENGINEER",
  "ML_ENGINEER",
  "DATA_SCIENTIST",
  "DATA_ANALYST",
  "DATA_ENGINEER",
  "PRODUCT_MANAGER",
  "DEVOPS_ENGINEER",
  "FRONTEND_ENGINEER",
  "BACKEND_ENGINEER",
  "FULLSTACK_ENGINEER",
] as const;

const JSON_HEADERS = { "Content-Type": "application/json" as const };

function validationError(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "VALIDATION_ERROR",
      message,
    } satisfies AnalyseErrorResponse,
    { status: 400, headers: JSON_HEADERS }
  );
}

function isRepoQualityError(error: unknown): error is { message: string; assessment: { signals: QualitySignal[] } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as Error).name === "RepoQualityError" &&
    "assessment" in error
  );
}

function isLessonPlanGenerationError(
  error: unknown
): error is { message: string; stage: "DESIGN_DECISIONS" | "LESSON_STUBS" | "TEST_QUESTIONS" } {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as Error).name === "LessonPlanGenerationError" &&
    "stage" in error
  );
}

export async function POST(request: NextRequest) {
  try {
    if (request.method !== "POST") {
      return NextResponse.json(
        { success: false, error: "Method not allowed" },
        { status: 405, headers: JSON_HEADERS }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationError("Invalid JSON body.");
    }

    if (typeof body !== "object" || body === null) {
      return validationError("Body must be a JSON object.");
    }

    const { githubUrl, targetRole } = body as Record<string, unknown>;

    if (typeof githubUrl !== "string" || githubUrl.trim() === "") {
      return validationError("githubUrl is required and must be a non-empty string.");
    }

    if (typeof targetRole !== "string" || !VALID_TARGET_ROLES.includes(targetRole as (typeof VALID_TARGET_ROLES)[number])) {
      return validationError(
        "targetRole is required and must be one of: SOFTWARE_ENGINEER, ML_ENGINEER, DATA_SCIENTIST, DATA_ANALYST, DATA_ENGINEER, PRODUCT_MANAGER, DEVOPS_ENGINEER, FRONTEND_ENGINEER, BACKEND_ENGINEER, FULLSTACK_ENGINEER."
      );
    }

    const url = githubUrl.trim();
    if (!url.startsWith("https://github.com/")) {
      return validationError("githubUrl must start with https://github.com/");
    }

    const pathPart = url.slice("https://github.com/".length).replace(/\/?\?.*$/, "");
    const segments = pathPart.split("/").filter(Boolean);
    if (segments.length < 2) {
      return validationError("githubUrl must include owner and repo (e.g. https://github.com/owner/repo).");
    }

    const pathLower = pathPart.toLowerCase();
    if (pathLower.includes("/gist")) {
      return validationError("Gist URLs are not supported.");
    }
    if (pathLower.includes("/blob/") || pathLower.includes("/tree/")) {
      return validationError("Direct blob or tree URLs are not supported. Use the repo root URL.");
    }

    const analysis = await analyseRepo(url);
    const lessonPlan = await generateLessonPlan(analysis, targetRole as Parameters<typeof generateLessonPlan>[1]);

    const repoMeta: RepoMetaSummary = {
      repoName: analysis.meta.repoName,
      repoUrl: analysis.meta.repoUrl,
      primaryLanguage: analysis.meta.primaryLanguage,
      repoType: analysis.meta.repoType,
      complexityScore: analysis.complexity.complexityScore,
      estimatedLessons: analysis.complexity.estimatedLessons,
      qualityTier: lessonPlan.qualityAssessment.quality,
      lessonMode: lessonPlan.qualityAssessment.lessonMode,
    };

    const successResponse: AnalyseSuccessResponse = {
      success: true,
      lessonPlan,
      repoMeta,
    };

    return NextResponse.json(successResponse, {
      status: 200,
      headers: {
        ...JSON_HEADERS,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (isRepoQualityError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "REPO_UNTEACHABLE",
          message: error.message,
          signals: error.assessment.signals,
        } satisfies AnalyseErrorResponse,
        { status: 422, headers: JSON_HEADERS }
      );
    }

    if (isLessonPlanGenerationError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "GENERATION_FAILED",
          message: error.message,
          stage: error.stage,
        } satisfies AnalyseErrorResponse,
        { status: 503, headers: JSON_HEADERS }
      );
    }

    if (error instanceof Error && error.message === "Timeout") {
      return NextResponse.json(
        {
          success: false,
          error: "TIMEOUT",
          message: "Analysis took too long. Please try again.",
        } satisfies AnalyseErrorResponse,
        { status: 408, headers: JSON_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      } satisfies AnalyseErrorResponse,
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
