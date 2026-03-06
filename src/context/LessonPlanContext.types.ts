import type { LessonPlan, TargetRole } from "../../githuburl/index";
import type { RepoMetaSummary } from "../app/api/analyse/types";

export type LessonPhase = "LEARN" | "DEFEND" | "UNLOCK";

export type LessonStatus = "LOCKED" | "ACTIVE" | "COMPLETE";

export type AnswerResult = "PASS" | "PARTIAL" | "FAIL" | "PENDING";

export interface QuestionAnswer {
  questionId: string;
  answer: string | string[];
  result: AnswerResult;
  feedback: string;
  evaluatedAt: string;
}

export interface LessonSessionState {
  lessonIndex: number;
  status: LessonStatus;
  phase: LessonPhase;
  answers: QuestionAnswer[];
  startedAt: string | null;
  completedAt: string | null;
}

export interface LessonPlanSessionState {
  lessonPlan: LessonPlan | null;
  repoMeta: RepoMetaSummary | null;
  status: "IDLE" | "LOADING" | "READY" | "ERROR";
  errorCode: string | null;
  errorMessage: string | null;
  qualitySignals: Array<{ name: string; passed: boolean; weight: number; detail: string }> | null;
  currentLessonIndex: number;
  lessonStates: LessonSessionState[];
}

export type LessonPlanAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; lessonPlan: LessonPlan; repoMeta: RepoMetaSummary }
  | {
      type: "FETCH_ERROR";
      errorCode: string;
      errorMessage: string;
      qualitySignals?: LessonPlanSessionState["qualitySignals"];
    }
  | { type: "RESET" }
  | { type: "SET_LESSON_PHASE"; lessonIndex: number; phase: LessonPhase }
  | { type: "RECORD_ANSWER"; lessonIndex: number; answer: QuestionAnswer }
  | { type: "COMPLETE_LESSON"; lessonIndex: number }
  | { type: "ADVANCE_TO_NEXT_LESSON" };
