"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { Lesson, TargetRole } from "../../githuburl/index";
import type {
  LessonPhase,
  LessonPlanAction,
  LessonPlanSessionState,
  LessonSessionState,
  QuestionAnswer,
} from "./LessonPlanContext.types";

const initialState: LessonPlanSessionState = {
  lessonPlan: null,
  repoMeta: null,
  status: "IDLE",
  errorCode: null,
  errorMessage: null,
  qualitySignals: null,
  currentLessonIndex: 0,
  lessonStates: [],
};

function lessonPlanReducer(
  state: LessonPlanSessionState,
  action: LessonPlanAction
): LessonPlanSessionState {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        status: "LOADING",
        errorCode: null,
        errorMessage: null,
        qualitySignals: null,
      };

    case "FETCH_SUCCESS":
      return {
        ...state,
        status: "READY",
        lessonPlan: action.lessonPlan,
        repoMeta: action.repoMeta,
        currentLessonIndex: 0,
        lessonStates: action.lessonPlan.lessons.map((_, index) => ({
          lessonIndex: index,
          status: index === 0 ? "ACTIVE" : "LOCKED",
          phase: "LEARN" as LessonPhase,
          answers: [],
          startedAt: index === 0 ? new Date().toISOString() : null,
          completedAt: null,
        })),
      };

    case "FETCH_ERROR":
      return {
        ...state,
        status: "ERROR",
        errorCode: action.errorCode,
        errorMessage: action.errorMessage,
        qualitySignals: action.qualitySignals ?? null,
      };

    case "RESET":
      return initialState;

    case "SET_LESSON_PHASE":
      return {
        ...state,
        lessonStates: state.lessonStates.map((ls, i) =>
          i === action.lessonIndex ? { ...ls, phase: action.phase } : ls
        ),
      };

    case "RECORD_ANSWER":
      return {
        ...state,
        lessonStates: state.lessonStates.map((ls, i) =>
          i === action.lessonIndex
            ? { ...ls, answers: [...ls.answers, action.answer] }
            : ls
        ),
      };

    case "COMPLETE_LESSON":
      return {
        ...state,
        lessonStates: state.lessonStates.map((ls, i) =>
          i === action.lessonIndex
            ? {
                ...ls,
                status: "COMPLETE",
                completedAt: new Date().toISOString(),
              }
            : ls
        ),
      };

    case "ADVANCE_TO_NEXT_LESSON": {
      const nextIndex = state.currentLessonIndex + 1;
      if (nextIndex >= state.lessonStates.length) return state;
      return {
        ...state,
        currentLessonIndex: nextIndex,
        lessonStates: state.lessonStates.map((ls, i) =>
          i === nextIndex
            ? {
                ...ls,
                status: "ACTIVE",
                phase: "LEARN",
                startedAt: new Date().toISOString(),
              }
            : ls
        ),
      };
    }

    default:
      return state;
  }
}

export interface LessonPlanContextValue {
  state: LessonPlanSessionState;
  fetchLessonPlan: (githubUrl: string, targetRole: TargetRole) => Promise<void>;
  setLessonPhase: (lessonIndex: number, phase: LessonPhase) => void;
  recordAnswer: (lessonIndex: number, answer: QuestionAnswer) => void;
  completeLesson: (lessonIndex: number) => void;
  advanceToNextLesson: () => void;
  reset: () => void;
  currentLesson: Lesson | null;
  currentLessonState: LessonSessionState | null;
  isLastLesson: boolean;
  completedCount: number;
  progressPercent: number;
}

const LessonPlanContext =
  createContext<LessonPlanContextValue | undefined>(undefined);

export function LessonPlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lessonPlanReducer, initialState);

  const fetchLessonPlan = useCallback(
    async (githubUrl: string, targetRole: TargetRole) => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ githubUrl, targetRole }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          dispatch({
            type: "FETCH_ERROR",
            errorCode: data.error ?? "INTERNAL_ERROR",
            errorMessage: data.message ?? "Something went wrong",
            qualitySignals: data.signals ?? undefined,
          });
          return;
        }

        dispatch({
          type: "FETCH_SUCCESS",
          lessonPlan: data.lessonPlan,
          repoMeta: data.repoMeta,
        });
      } catch {
        dispatch({
          type: "FETCH_ERROR",
          errorCode: "INTERNAL_ERROR",
          errorMessage: "Could not reach the server. Please try again.",
        });
      }
    },
    []
  );

  const setLessonPhase = useCallback((lessonIndex: number, phase: LessonPhase) => {
    dispatch({ type: "SET_LESSON_PHASE", lessonIndex, phase });
  }, []);

  const recordAnswer = useCallback(
    (lessonIndex: number, answer: QuestionAnswer) => {
      dispatch({ type: "RECORD_ANSWER", lessonIndex, answer });
    },
    []
  );

  const completeLesson = useCallback((lessonIndex: number) => {
    dispatch({ type: "COMPLETE_LESSON", lessonIndex });
  }, []);

  const advanceToNextLesson = useCallback(() => {
    dispatch({ type: "ADVANCE_TO_NEXT_LESSON" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const contextValue = useMemo<LessonPlanContextValue>(() => {
    const currentLesson =
      state.lessonPlan?.lessons[state.currentLessonIndex] ?? null;
    const currentLessonState =
      state.lessonStates[state.currentLessonIndex] ?? null;
    const totalLessons = state.lessonPlan?.lessons.length ?? 0;
    const completedCount = state.lessonStates.filter(
      (ls) => ls.status === "COMPLETE"
    ).length;
    const progressPercent =
      totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
    const isLastLesson =
      totalLessons > 0 && state.currentLessonIndex >= totalLessons - 1;

    return {
      state,
      fetchLessonPlan,
      setLessonPhase,
      recordAnswer,
      completeLesson,
      advanceToNextLesson,
      reset,
      currentLesson,
      currentLessonState,
      isLastLesson,
      completedCount,
      progressPercent,
    };
  }, [
    state,
    fetchLessonPlan,
    setLessonPhase,
    recordAnswer,
    completeLesson,
    advanceToNextLesson,
    reset,
  ]);

  return (
    <LessonPlanContext.Provider value={contextValue}>
      {children}
    </LessonPlanContext.Provider>
  );
}

export { LessonPlanContext };
