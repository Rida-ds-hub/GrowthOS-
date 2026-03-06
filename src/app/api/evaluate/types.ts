export type EvalResult = "PASS" | "PARTIAL" | "FAIL";

export interface EvaluateRequest {
  questionId: string;
  questionText: string;
  answer: string;
  reasoningGuidance: string;
  keyLearning: string;
  targetRole: string;
  questionType: "DEFEND_DECISION" | "PROPOSE_ALTERNATIVE";
}

export interface EvaluateSuccessResponse {
  success: true;
  questionId: string;
  result: EvalResult;
  feedback: string;
}

export interface EvaluateErrorResponse {
  success: false;
  error: "VALIDATION_ERROR" | "EVALUATION_FAILED" | "TIMEOUT" | "INTERNAL_ERROR";
  message: string;
}

export type EvaluateResponse = EvaluateSuccessResponse | EvaluateErrorResponse;
