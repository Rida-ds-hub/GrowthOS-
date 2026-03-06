import type { TargetRole, LessonPlan } from "../../../../githuburl/index";

/** API-boundary type for quality signals in 422 responses (matches githuburl QualitySignal shape). */
export interface QualitySignal {
  name: string;
  passed: boolean;
  weight: number;
  detail: string;
}

export interface AnalyseRequest {
  githubUrl: string;
  targetRole: TargetRole;
}

export interface AnalyseSuccessResponse {
  success: true;
  lessonPlan: LessonPlan;
  repoMeta: RepoMetaSummary;
}

export interface RepoMetaSummary {
  repoName: string;
  repoUrl: string;
  primaryLanguage: string;
  repoType: string;
  complexityScore: number;
  estimatedLessons: number;
  qualityTier: string;
  lessonMode: string;
}

export type AnalyseErrorCode =
  | "VALIDATION_ERROR"
  | "REPO_UNTEACHABLE"
  | "GENERATION_FAILED"
  | "TIMEOUT"
  | "INTERNAL_ERROR";

export interface AnalyseErrorResponse {
  success: false;
  error: AnalyseErrorCode;
  message: string;
  signals?: QualitySignal[];
  stage?: "DESIGN_DECISIONS" | "LESSON_STUBS" | "TEST_QUESTIONS";
}

export type AnalyseResponse = AnalyseSuccessResponse | AnalyseErrorResponse;
