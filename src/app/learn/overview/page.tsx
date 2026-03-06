"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLessonPlan } from "@/hooks/useLessonPlan";
import type { LessonSessionState } from "@/context/LessonPlanContext.types";

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "...";
}

function formatConceptType(conceptType: string): string {
  return conceptType.replace(/_/g, " ").toLowerCase();
}

export default function LearnOverviewPage() {
  const router = useRouter();
  const {
    state,
    completedCount,
    progressPercent,
    currentLessonIndex,
    isLastLesson,
  } = useLessonPlan();

  const [expandedDecisions, setExpandedDecisions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state.status !== "READY") {
      router.replace("/learn");
    }
  }, [state.status, router]);

  const toggleDecision = useCallback((id: string) => {
    setExpandedDecisions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBeginDay = useCallback(() => {
    router.push("/learn/lesson");
  }, [router]);

  if (state.status !== "READY") {
    return null;
  }

  const lessonPlan = state.lessonPlan ?? null;
  const repoMeta = state.repoMeta ?? null;
  const lessons = lessonPlan?.lessons ?? [];
  const designDecisions = lessonPlan?.designDecisions ?? [];
  const totalLessons = lessonPlan?.totalLessons ?? 0;
  const lessonStates = state.lessonStates ?? [];
  const estimatedDays = lessonPlan?.estimatedDays ?? 0;
  const generatedAt = lessonPlan?.generatedAt ?? "";

  const progressFilled = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 16) : 0;
  const progressEmpty = 16 - progressFilled;
  const repoUrlDisplay = repoMeta?.repoUrl ? truncate(repoMeta.repoUrl, 50) : "";
  const qualityTier = repoMeta?.qualityTier ?? "TEACHABLE";

  const allComplete = totalLessons > 0 && completedCount >= totalLessons;
  const showCourseComplete = isLastLesson && allComplete;

  const qualityLabel =
    qualityTier === "POOR"
      ? "[CRITIQUE MODE] — this repo has structural issues worth studying"
      : `[${qualityTier}] — explanatory mode`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono px-6 py-12 max-w-2xl mx-auto">
      {/* Section 1: Mission Header */}
      <p className="text-sm text-neutral-600 mb-6">
        // growth_os · learn · mission_briefing
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h1 className="text-2xl text-neutral-200">{repoMeta?.repoName ?? ""}</h1>
        <span className="text-[#4ade80] border border-[#4ade80] px-2 py-0.5 text-sm shrink-0">
          [{lessonPlan?.targetRole ?? "SOFTWARE_ENGINEER"}]
        </span>
      </div>

      <p className="text-sm text-neutral-600 mb-1">// {repoUrlDisplay}</p>
      <p className="text-sm text-neutral-600 mb-6">
        // {repoMeta?.primaryLanguage ?? ""} · complexity {repoMeta?.complexityScore ?? 0}/10 ·{" "}
        {repoMeta?.estimatedLessons ?? 0} lessons · ~{estimatedDays} days
      </p>

      <p className="text-sm text-neutral-400 mb-6">
        progress{" "}
        <span className="text-neutral-200">
          {"█".repeat(progressFilled)}
          {"░".repeat(progressEmpty)}
        </span>{" "}
        {completedCount}/{totalLessons} complete
      </p>

      <p
        className={`text-sm mb-1 ${
          qualityTier === "POOR" ? "text-amber-400" : "text-[#4ade80]"
        }`}
      >
        // quality: {qualityLabel}
      </p>
      <p className="text-sm text-neutral-600 mb-12">// generated {relativeTime(generatedAt)}</p>

      {/* Section 2: Design Decisions */}
      <p className="text-sm text-neutral-600 mb-4">
        // architectural decisions detected in this repository
      </p>

      {designDecisions.length === 0 ? (
        <p className="text-sm text-neutral-600 mb-12">
          // no distinct design decisions were detected in this repository
        </p>
      ) : (
        <div className="space-y-6 mb-12">
          {designDecisions.map((decision, idx) => {
            const isExpanded = expandedDecisions.has(decision.id);
            const num = String(idx + 1).padStart(2, "0");
            return (
              <div key={decision.id} className="border-b border-neutral-900 pb-6 last:border-b-0">
                <p className="text-sm text-neutral-600 mb-1">{num}</p>
                <p className="text-neutral-200 mb-1">{decision.title}</p>
                <p className="text-sm text-neutral-600 mb-1">
                  {truncate(decision.problem, 100)}
                </p>
                <p className="text-sm text-neutral-600 mb-2">
                  <span className="text-[#4ade80]">// tradeoff:</span> {decision.tradeoff}
                </p>
                <button
                  type="button"
                  onClick={() => toggleDecision(decision.id)}
                  className="text-sm text-neutral-500 hover:text-neutral-400 focus:outline-none mb-2"
                >
                  {isExpanded ? "[hide alternatives ▲]" : "[show alternatives ▾]"}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? "max-h-40" : "max-h-0"
                  }`}
                >
                  {decision.alternativesConsidered?.length > 0 && (
                    <div className="text-sm text-neutral-600">
                      <p className="text-[#4ade80]">// alternatives considered:</p>
                      {decision.alternativesConsidered.map((alt, i) => (
                        <p key={i}>//   · {alt}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section 3: Lesson Timeline */}
      <p className="text-sm text-neutral-600 mb-4">
        // your {estimatedDays}-day learning path
      </p>

      <div className="space-y-0">
        {lessons.map((lesson, idx) => {
          const sessionState: LessonSessionState | undefined = lessonStates[idx];
          const status = sessionState?.status ?? "LOCKED";
          const dayLabel = `day_${String(lesson.dayNumber).padStart(2, "0")}`;
          const isActive = status === "ACTIVE";
          const isComplete = status === "COMPLETE";
          const isLocked = status === "LOCKED";

          return (
            <div
              key={idx}
              className={`py-3 border-b border-neutral-900 last:border-b-0 ${
                isLocked ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  className={`text-sm shrink-0 ${
                    isActive || isComplete ? "text-[#4ade80]" : "text-neutral-600"
                  }`}
                >
                  {isActive ? "▸" : isComplete ? "✓" : "—"}
                </span>
                <span className="text-sm text-neutral-600 shrink-0">{dayLabel}</span>
                <span className="text-neutral-200">{lesson.title}</span>
                <span
                  className={`text-sm shrink-0 ${
                    isActive || isComplete ? "text-[#4ade80]" : "text-neutral-600"
                  }`}
                >
                  [{status}]
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-1 ml-6">
                // {formatConceptType(lesson.conceptType)} · {lesson.estimatedMinutes} min
              </p>
              {isActive && lesson.coreQuestion && (
                <p className="text-sm text-neutral-600 mt-0.5 ml-6">
                  // {lesson.coreQuestion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        {showCourseComplete ? (
          <div className="w-full font-mono text-neutral-600 border border-neutral-700 py-2 text-center">
            [ course complete · view portfolio → ]
          </div>
        ) : (
          <button
            type="button"
            onClick={handleBeginDay}
            className="w-full font-mono text-[#4ade80] border border-[#4ade80] bg-transparent py-2 transition-all duration-150 hover:bg-[#4ade80] hover:text-black focus:outline-none"
          >
            [ begin day {currentLessonIndex + 1} → ]
          </button>
        )}
      </div>
    </div>
  );
}
