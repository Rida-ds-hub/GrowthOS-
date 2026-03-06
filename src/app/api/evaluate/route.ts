import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  EvalResult,
  EvaluateErrorResponse,
  EvaluateSuccessResponse,
} from "./types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EVAL_TIMEOUT_MS = 15_000;
const VALID_QUESTION_TYPES = ["DEFEND_DECISION", "PROPOSE_ALTERNATIVE"] as const;
const VALID_RESULTS: EvalResult[] = ["PASS", "PARTIAL", "FAIL"];

const JSON_HEADERS = {
  "Content-Type": "application/json" as const,
  "Cache-Control": "no-store" as const,
};

function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

function validationError(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "VALIDATION_ERROR",
      message,
    } satisfies EvaluateErrorResponse,
    { status: 400, headers: JSON_HEADERS }
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
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid JSON body.",
        } satisfies EvaluateErrorResponse,
        { status: 400, headers: JSON_HEADERS }
      );
    }

    if (typeof body !== "object" || body === null) {
      return validationError("Body must be a JSON object.");
    }

    const b = body as Record<string, unknown>;

    if (typeof b.questionId !== "string" || b.questionId.trim() === "") {
      return validationError("questionId is required and must be a non-empty string.");
    }

    if (typeof b.answer !== "string" || b.answer.trim() === "") {
      return validationError("answer is required and must be a non-empty string.");
    }

    if (b.answer.trim().length < 10) {
      return validationError("Answer must be at least 10 characters");
    }

    if (typeof b.reasoningGuidance !== "string" || b.reasoningGuidance.trim() === "") {
      return validationError("reasoningGuidance is required and must be a non-empty string.");
    }

    if (typeof b.keyLearning !== "string" || b.keyLearning.trim() === "") {
      return validationError("keyLearning is required and must be a non-empty string.");
    }

    if (
      typeof b.questionType !== "string" ||
      !VALID_QUESTION_TYPES.includes(b.questionType as (typeof VALID_QUESTION_TYPES)[number])
    ) {
      return validationError(
        "questionType must be DEFEND_DECISION or PROPOSE_ALTERNATIVE."
      );
    }

    if (typeof b.targetRole !== "string" || b.targetRole.trim() === "") {
      return validationError("targetRole is required and must be a non-empty string.");
    }

    const questionId = (b.questionId as string).trim();
    const questionText = (typeof b.questionText === "string" ? b.questionText : "").trim();
    const answer = (b.answer as string).trim();
    const reasoningGuidance = (b.reasoningGuidance as string).trim();
    const keyLearning = (b.keyLearning as string).trim();
    const targetRole = (b.targetRole as string).trim();
    const questionType = b.questionType as "DEFEND_DECISION" | "PROPOSE_ALTERNATIVE";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "placeholder-key") {
      return NextResponse.json(
        {
          success: false,
          error: "EVALUATION_FAILED",
          message: "Evaluation service not configured",
        } satisfies EvaluateErrorResponse,
        { status: 503, headers: JSON_HEADERS }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const systemPrompt = `You are a technical assessment evaluator for an engineering learning platform.
You evaluate free-text answers to architectural reasoning questions.
You are fair, precise, and concise.
Your evaluation has three tiers: PASS, PARTIAL, FAIL.

PASS: The answer demonstrates clear understanding of the design decision or
tradeoff. The reasoning is sound even if not perfectly articulated.
Partial credit is not needed.

PARTIAL: The answer shows some understanding but misses a key aspect of the
reasoning, conflates concepts, or is too vague to confirm understanding.

FAIL: The answer does not demonstrate understanding of the concept, is
off-topic, is too short to evaluate, or restates the question without reasoning.

You respond ONLY with a JSON object. No markdown. No preamble. No explanation
outside the JSON.`;

    const userPrompt = `Evaluate this answer to an architectural reasoning question.

Question type: ${questionType}
Target role: ${targetRole}
Question: ${questionText}

What good reasoning looks like:
${reasoningGuidance}

The core learning this question tests:
${keyLearning}

Learner's answer:
"${answer}"

Return exactly this JSON shape:
{
  "result": "PASS" | "PARTIAL" | "FAIL",
  "feedback": "one sentence of specific, constructive feedback for the learner"
}

Rules for feedback:
- If PASS: affirm what they got right in one sentence
- If PARTIAL: name the one thing they missed in one sentence
- If FAIL: name what the answer needed that was absent, in one sentence
- Never say "your answer" — address the concept directly
- Never exceed one sentence
- Never use the words "correct" or "incorrect"`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const result = await timeout(
      (async () => {
        const res = await model.generateContent(fullPrompt);
        return res.response.text() ?? "{}";
      })(),
      EVAL_TIMEOUT_MS
    );

    const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let parsed: { result?: string; feedback?: string };
    try {
      parsed = JSON.parse(cleaned) as { result?: string; feedback?: string };
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "EVALUATION_FAILED",
          message: "Evaluation service unavailable. Please try again.",
        } satisfies EvaluateErrorResponse,
        { status: 503, headers: JSON_HEADERS }
      );
    }

    const resultVal =
      typeof parsed.result === "string" && VALID_RESULTS.includes(parsed.result as EvalResult)
        ? (parsed.result as EvalResult)
        : "PARTIAL";
    const feedbackVal =
      typeof parsed.feedback === "string" && parsed.feedback.trim() !== ""
        ? parsed.feedback.trim()
        : keyLearning;

    const successResponse: EvaluateSuccessResponse = {
      success: true,
      questionId,
      result: resultVal,
      feedback: feedbackVal,
    };

    return NextResponse.json(successResponse, {
      status: 200,
      headers: JSON_HEADERS,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Timeout") {
      return NextResponse.json(
        {
          success: false,
          error: "TIMEOUT",
          message: "Evaluation timed out. Please try again.",
        } satisfies EvaluateErrorResponse,
        { status: 408, headers: JSON_HEADERS }
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "EVALUATION_FAILED",
          message: "Evaluation service unavailable. Please try again.",
        } satisfies EvaluateErrorResponse,
        { status: 503, headers: JSON_HEADERS }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      } satisfies EvaluateErrorResponse,
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
