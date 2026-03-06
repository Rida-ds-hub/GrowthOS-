"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLessonPlan } from "@/hooks/useLessonPlan";
import type { AnswerResult } from "@/context/LessonPlanContext.types";

function formatRole(role: string): string {
  return role.toLowerCase().replace(/_/g, " ");
}

function formatConceptType(conceptType: string): string {
  return conceptType.replace(/_/g, " ").toLowerCase();
}

/** Minimal lesson shape for unlock helpers (matches currentLesson from context). */
interface LessonForUnlock {
  dayNumber: number;
  title: string;
  tradeoff: string;
  coreInsight: string;
  conceptType: string;
  fileAnchors?: string[];
  designDecisionRef?: string;
}

function buildFileUrl(repoUrl: string, filePath: string): string {
  const base = repoUrl.replace(/\/$/, "");
  return `${base}/blob/main/${filePath}`;
}

function getFileAnnotation(filePath: string, lesson: LessonForUnlock): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const conceptType = lesson.conceptType.toLowerCase().replace(/_/g, " ");
  const pathLower = filePath.toLowerCase();

  if (ext === "ipynb") {
    return `notebook containing the ${conceptType} implementation`;
  }
  if (pathLower.includes("model")) {
    const part = lesson.tradeoff.split(" but ")[0]?.trim() ?? "design";
    return `model definition — look for the ${part} pattern`;
  }
  if (pathLower.includes("train")) {
    return "training pipeline — observe how data flows through the architecture";
  }
  if (pathLower.includes("test")) {
    return "test suite — note what the author chose to verify (and what they didn't)";
  }
  if (pathLower.includes("config")) {
    return "configuration — these values encode the tradeoffs you just defended";
  }
  return `contains the ${conceptType} you just studied`;
}

function generateCommitMessage(lesson: LessonForUnlock, repoName: string): string {
  const msg = `lesson ${lesson.dayNumber}: ${lesson.title.toLowerCase()} - ${repoName}`;
  return msg.length > 72 ? msg.slice(0, 69) + "..." : msg;
}

export default function LearnLessonPage() {
  const router = useRouter();
  const {
    state,
    currentLesson,
    currentLessonState,
    setLessonPhase,
    recordAnswer,
    completeLesson,
    advanceToNextLesson,
    isLastLesson,
  } = useLessonPlan();

  const [readProgress, setReadProgress] = useState(0);
  const [continueVisible, setContinueVisible] = useState(false);
  const [pendingFreeText, setPendingFreeText] = useState<Record<string, string>>({});
  const [submittingQuestionId, setSubmittingQuestionId] = useState<string | null>(null);
  const [rankedOrders, setRankedOrders] = useState<Record<string, string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const defaultCommitMessage =
    currentLesson && state.lessonPlan?.repoName
      ? generateCommitMessage(currentLesson, state.lessonPlan.repoName)
      : "";
  const [commitMessage, setCommitMessage] = useState(defaultCommitMessage);

  const currentLessonIndex = state.currentLessonIndex ?? 0;
  const targetRole = state.lessonPlan?.targetRole ?? "SOFTWARE_ENGINEER";

  const handleSubmitFreeText = useCallback(
    async (
      questionId: string,
      questionText: string,
      answer: string,
      reasoningGuidance: string,
      keyLearning: string,
      questionType: "DEFEND_DECISION" | "PROPOSE_ALTERNATIVE"
    ) => {
      setSubmittingQuestionId(questionId);
      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId,
            questionText,
            answer,
            reasoningGuidance: reasoningGuidance || "Explain your reasoning clearly.",
            keyLearning,
            targetRole,
            questionType,
          }),
        });
        const data = await res.json();
        if (data.success && data.result && data.feedback != null) {
          recordAnswer(currentLessonIndex, {
            questionId,
            answer,
            result: data.result as AnswerResult,
            feedback: data.feedback,
            evaluatedAt: new Date().toISOString(),
          });
          setPendingFreeText((prev) => {
            const next = { ...prev };
            delete next[questionId];
            return next;
          });
        }
      } finally {
        setSubmittingQuestionId(null);
      }
    },
    [currentLessonIndex, targetRole, recordAnswer]
  );

  const handleSubmitRanked = useCallback(
    (questionId: string, order: string[], correctRankOrder: string[] | null, options: { id: string; text: string; isCorrect: boolean; explanation: string }[] | null) => {
      const result: AnswerResult =
        correctRankOrder && order.length === correctRankOrder.length && order.every((id, i) => id === correctRankOrder[i])
          ? "PASS"
          : correctRankOrder && order.some((id, i) => id === correctRankOrder[i])
            ? "PARTIAL"
            : "FAIL";
      const option = (options ?? []).find((o) => o.id === order[0]);
      recordAnswer(currentLessonIndex, {
        questionId,
        answer: order,
        result,
        feedback: option?.explanation ?? (result === "PASS" ? "Correct order." : "Review the tradeoff."),
        evaluatedAt: new Date().toISOString(),
      });
      setRankedOrders((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    },
    [currentLessonIndex, recordAnswer]
  );

  const handleSubmitMultiSelect = useCallback(
    (questionId: string, selected: string[], correctOptionIds: string[] | null, keyLearning: string) => {
      const correctSet = new Set(correctOptionIds ?? []);
      const hit = selected.filter((id) => correctSet.has(id)).length;
      const result: AnswerResult =
        correctSet.size === selected.length && hit === correctSet.size
          ? "PASS"
          : hit > 0
            ? "PARTIAL"
            : "FAIL";
      recordAnswer(currentLessonIndex, {
        questionId,
        answer: selected,
        result,
        feedback: keyLearning || (result === "PASS" ? "Correct." : "Review the options."),
        evaluatedAt: new Date().toISOString(),
      });
      setSelectedOptions((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    },
    [currentLessonIndex, recordAnswer]
  );

  useEffect(() => {
    if (state.status !== "READY" || !currentLesson) {
      router.replace("/learn");
    }
  }, [state.status, currentLesson, router]);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setContinueVisible(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const lesson = state.lessonPlan?.lessons[state.currentLessonIndex] ?? null;
    setPendingFreeText({});
    setSubmittingQuestionId(null);
    setRankedOrders({});
    setSelectedOptions({});
    setReadProgress(0);
    setContinueVisible(false);
    setCommitMessage(
      lesson && state.lessonPlan?.repoName
        ? generateCommitMessage(lesson, state.lessonPlan.repoName)
        : ""
    );
  }, [state.currentLessonIndex]);

  if (state.status !== "READY" || !currentLesson) {
    return null;
  }

  const phase = currentLessonState?.phase ?? "LEARN";

  if (phase === "DEFEND") {
    const testQuestions = currentLesson.testQuestions ?? [];
    const answers = currentLessonState?.answers ?? [];
    const answeredIds = new Set(answers.map((a) => a.questionId));
    const allAnswered = testQuestions.length > 0 && testQuestions.every((q) => answeredIds.has(q.id));

    return (
      <>
        <div
          style={{ width: `${readProgress}%` }}
          className="fixed top-0 left-0 h-[2px] bg-[#4ade80] z-50 transition-all duration-100"
          aria-hidden
        />
        <div className="min-h-screen bg-[#0a0a0a] font-mono px-6 py-12 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => router.push("/learn/overview")}
            className="text-sm text-neutral-600 hover:text-neutral-400 mb-6 focus:outline-none"
          >
            ← overview
          </button>
          <p className="text-sm text-neutral-600 mb-2">
            // growth_os · learn · day_{currentLesson.dayNumber}
          </p>
          <h1 className="text-2xl text-neutral-200 mb-2">{currentLesson.title}</h1>
          <p className="text-sm text-neutral-600 mb-8">
            // defend · {testQuestions.length} question{testQuestions.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2 mb-10 text-sm">
            <span className="text-[#4ade80] border border-[#4ade80] px-2 py-0.5">✓ [learn]</span>
            <span className="text-neutral-600">────────</span>
            <span className="text-[#4ade80] border border-[#4ade80] px-2 py-0.5">[defend]</span>
            <span className="text-neutral-600">────────</span>
            <span className="text-neutral-600 border border-neutral-700 px-2 py-0.5">[unlock]</span>
          </div>

          <div className="space-y-8">
            {testQuestions.map((q) => {
              const existing = answers.find((a) => a.questionId === q.id);
              if (existing) {
                return (
                  <div key={q.id} className="border border-neutral-800 p-4">
                    <p className="text-sm text-neutral-400 mb-2">{q.question}</p>
                    <p className={`text-sm mb-1 ${existing.result === "PASS" ? "text-[#4ade80]" : existing.result === "PARTIAL" ? "text-amber-400" : "text-red-400"}`}>
                      [{existing.result}]
                    </p>
                    <p className="text-sm text-neutral-400 italic">{existing.feedback}</p>
                  </div>
                );
              }
              if (q.responseFormat === "FREE_TEXT" && (q.type === "DEFEND_DECISION" || q.type === "PROPOSE_ALTERNATIVE")) {
                const text = pendingFreeText[q.id] ?? "";
                const rubric = q.rubric;
                return (
                  <div key={q.id} className="border border-neutral-800 p-4">
                    <p className="text-sm text-neutral-200 mb-3">{q.question}</p>
                    <textarea
                      value={text}
                      onChange={(e) => setPendingFreeText((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="2–3 sentences..."
                      className="w-full font-mono text-sm text-neutral-200 bg-[#0a0a0a] border border-neutral-700 px-3 py-2 focus:border-[#4ade80] focus:outline-none min-h-[100px]"
                      disabled={!!submittingQuestionId}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleSubmitFreeText(
                          q.id,
                          q.question,
                          text.trim(),
                          rubric?.reasoningGuidance ?? "",
                          rubric?.keyLearning ?? "",
                          q.type
                        )
                      }
                      disabled={text.trim().length < 10 || submittingQuestionId === q.id}
                      className="mt-2 font-mono text-sm text-[#4ade80] border border-[#4ade80] bg-transparent px-3 py-1.5 transition-all duration-150 hover:bg-[#4ade80] hover:text-black disabled:border-neutral-700 disabled:text-neutral-500 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
                    >
                      {submittingQuestionId === q.id ? "[ evaluating... ]" : "[ submit ]"}
                    </button>
                  </div>
                );
              }
              if (q.responseFormat === "RANKED_CHOICE" && q.options?.length) {
                const order = rankedOrders[q.id] ?? q.options.map((o) => o.id);
                const correctRankOrder = q.rubric?.correctRankOrder ?? null;
                return (
                  <div key={q.id} className="border border-neutral-800 p-4">
                    <p className="text-sm text-neutral-200 mb-3">{q.question}</p>
                    <p className="text-xs text-neutral-600 mb-2">// rank from first to last</p>
                    <ul className="space-y-2">
                      {order.map((optionId, idx) => {
                        const opt = q.options!.find((o) => o.id === optionId)!;
                        return (
                          <li key={optionId} className="flex items-center gap-2 text-sm text-neutral-200">
                            <span className="text-neutral-600 w-6">{idx + 1}.</span>
                            {opt.text}
                            <button
                              type="button"
                              onClick={() => {
                                if (idx === 0) return;
                                const next = [...order];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                setRankedOrders((prev) => ({ ...prev, [q.id]: next }));
                              }}
                              className="text-neutral-500 hover:text-[#4ade80] ml-1"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (idx === order.length - 1) return;
                                const next = [...order];
                                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                setRankedOrders((prev) => ({ ...prev, [q.id]: next }));
                              }}
                              className="text-neutral-500 hover:text-[#4ade80]"
                            >
                              ↓
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleSubmitRanked(q.id, order, correctRankOrder, q.options)}
                      className="mt-3 font-mono text-sm text-[#4ade80] border border-[#4ade80] bg-transparent px-3 py-1.5 transition-all duration-150 hover:bg-[#4ade80] hover:text-black"
                    >
                      [ submit ]
                    </button>
                  </div>
                );
              }
              if (q.responseFormat === "MULTI_SELECT" && q.options?.length) {
                const selected = selectedOptions[q.id] ?? [];
                const correctOptionIds = q.rubric?.correctOptionIds ?? null;
                const toggle = (optionId: string) => {
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [q.id]: selected.includes(optionId)
                      ? selected.filter((id) => id !== optionId)
                      : [...selected, optionId],
                  }));
                };
                return (
                  <div key={q.id} className="border border-neutral-800 p-4">
                    <p className="text-sm text-neutral-200 mb-3">{q.question}</p>
                    <ul className="space-y-2">
                      {q.options!.map((opt) => (
                        <li key={opt.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            id={`${q.id}-${opt.id}`}
                            checked={selected.includes(opt.id)}
                            onChange={() => toggle(opt.id)}
                            className="border-neutral-600 bg-[#0a0a0a] text-[#4ade80] focus:ring-[#4ade80]"
                          />
                          <label htmlFor={`${q.id}-${opt.id}`} className="text-neutral-200">
                            {opt.text}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleSubmitMultiSelect(q.id, selected, correctOptionIds, q.rubric?.keyLearning ?? "")}
                      disabled={selected.length === 0}
                      className="mt-3 font-mono text-sm text-[#4ade80] border border-[#4ade80] bg-transparent px-3 py-1.5 transition-all duration-150 hover:bg-[#4ade80] hover:text-black disabled:border-neutral-700 disabled:text-neutral-500 disabled:hover:bg-transparent"
                    >
                      [ submit ]
                    </button>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {allAnswered && (
            <div className="mt-12">
              <button
                type="button"
                onClick={() => setLessonPhase(currentLessonIndex, "UNLOCK")}
                className="w-full font-mono text-[#4ade80] border border-[#4ade80] bg-transparent py-2 transition-all duration-150 hover:bg-[#4ade80] hover:text-black focus:outline-none"
              >
                [ continue to unlock → ]
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  if (phase === "UNLOCK") {
    const repoUrl = state.lessonPlan?.repoUrl ?? "";
    const fileAnchors = currentLesson.fileAnchors ?? [];
    const designDecision = currentLesson.designDecisionRef
      ? state.lessonPlan?.designDecisions?.find((d) => d.id === currentLesson.designDecisionRef)
      : null;
    const gitAddLine =
      fileAnchors.length > 0
        ? (fileAnchors.join(" ").length > 60 ? fileAnchors.join(" ").slice(0, 57) + "..." : fileAnchors.join(" "))
        : ".";

    return (
      <>
        <div
          style={{ width: `${readProgress}%` }}
          className="fixed top-0 left-0 h-[2px] bg-[#4ade80] z-50 transition-all duration-100"
          aria-hidden
        />
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .unlock-block-1 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 0ms; }
          .unlock-block-2 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 300ms; }
          .unlock-block-3 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 600ms; }
          .unlock-block-4 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 900ms; }
          .unlock-block-5 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 1200ms; }
        `}</style>
        <div className="min-h-screen bg-[#0a0a0a] font-mono px-6 py-12 max-w-2xl mx-auto">
          <div className="unlock-block-1">
            <button
              type="button"
              onClick={() => router.push("/learn/overview")}
              className="text-sm text-neutral-600 hover:text-neutral-400 mb-6 focus:outline-none"
            >
              ← overview
            </button>
            <p className="text-sm text-neutral-600 mb-2">
              // growth_os · learn · day_{currentLesson.dayNumber} · unlock
            </p>
            <h1 className="text-2xl text-neutral-200 mb-2">
              <span className="text-[#4ade80]">&gt;</span> lesson unlocked.
            </h1>
            <p className="text-sm text-neutral-600 mb-8">
              // you defended the architecture. now see the code.
            </p>
            <div className="flex items-center gap-2 mb-10 text-sm">
              <span className="text-[#4ade80] border border-[#4ade80] px-2 py-0.5">✓ [learn]</span>
              <span className="text-neutral-600">────────</span>
              <span className="text-[#4ade80] border border-[#4ade80] px-2 py-0.5">✓ [defend]</span>
              <span className="text-neutral-600">────────</span>
              <span className="text-[#4ade80] border border-[#4ade80] px-2 py-0.5">[unlock]</span>
            </div>
          </div>

          <div className="unlock-block-2 mb-8">
            <p className="text-sm text-neutral-600 mb-2">// what you just proved you understand:</p>
            <div className="bg-neutral-900 border border-neutral-800 p-4">
              <p className="text-neutral-200 mb-2">{currentLesson.coreInsight}</p>
              <p className="text-sm">
                <span className="text-[#4ade80]">// tradeoff:</span>{" "}
                <span className="text-neutral-400">{currentLesson.tradeoff}</span>
              </p>
              {designDecision && (
                <p className="text-sm text-neutral-600 mt-2">// decision: {designDecision.title}</p>
              )}
            </div>
          </div>

          <div className="unlock-block-3 mb-8">
            <p className="text-sm text-neutral-600 mb-4">// the code behind this lesson:</p>
            {fileAnchors.length > 0 ? (
              <div className="space-y-4">
                {fileAnchors.map((filePath) => (
                  <div key={filePath}>
                    <p className="text-neutral-200 font-mono">
                      <span className="text-[#4ade80]">▸</span> {filePath}
                    </p>
                    <p className="text-sm text-neutral-600 ml-4">
                      // {getFileAnnotation(filePath, currentLesson)}
                    </p>
                    <a
                      href={buildFileUrl(repoUrl, filePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-600 hover:text-[#4ade80] ml-4 inline-block"
                    >
                      → view on github ↗
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm text-neutral-600 mb-1">
                  // no specific files identified for this lesson.
                </p>
                <p className="text-sm text-neutral-600 mb-2">
                  // explore the repository directly to find the patterns you studied.
                </p>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 hover:text-[#4ade80]"
                >
                  → view repository ↗
                </a>
              </div>
            )}
            <p className="text-sm text-neutral-600 mt-4">// what to look for:</p>
            <p className="text-sm text-neutral-400 mt-1">{currentLesson.coreInsight}</p>
          </div>

          <div className="unlock-block-4 mb-8">
            <p className="text-sm text-neutral-600 mb-2">// commit your progress:</p>
            <div className="bg-neutral-900 border border-neutral-800 p-4">
              <p className="text-sm text-neutral-400 font-mono mb-1">$ git add {gitAddLine}</p>
              <p className="text-sm text-neutral-400 font-mono mb-1">$ git commit -m "{commitMessage}"</p>
              <p className="text-sm text-neutral-400 font-mono mb-4">$ git push origin main</p>
              <div className="mb-4">
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full font-mono text-sm text-neutral-200 bg-[#0a0a0a] border border-neutral-700 px-3 py-2 focus:border-[#4ade80] focus:outline-none"
                />
              </div>
              <button
                type="button"
                disabled
                title="GitHub connection coming soon"
                className="w-full font-mono text-neutral-500 border border-neutral-700 py-2 cursor-not-allowed opacity-50"
              >
                [ commit & push ]
              </button>
            </div>
            <p className="text-sm text-neutral-600 mt-2">// github connection required · coming soon</p>
            <p className="text-sm text-neutral-600">// each commit builds your portfolio</p>
          </div>

          <div className="unlock-block-5 mt-12">
            {isLastLesson ? (
              <button
                type="button"
                onClick={() => {
                  completeLesson(currentLessonIndex);
                  router.push("/learn/overview");
                }}
                className="w-full font-mono text-[#4ade80] border border-[#4ade80] bg-transparent py-2 transition-all duration-150 hover:bg-[#4ade80] hover:text-black focus:outline-none"
              >
                [ complete lesson · course finished → ]
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  completeLesson(currentLessonIndex);
                  advanceToNextLesson();
                  router.push("/learn/overview");
                }}
                className="w-full font-mono text-[#4ade80] border border-[#4ade80] bg-transparent py-2 transition-all duration-150 hover:bg-[#4ade80] hover:text-black focus:outline-none"
              >
                [ complete lesson · day {currentLesson.dayNumber + 1} tomorrow → ]
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  const totalLessons = state.lessonPlan?.lessons?.length ?? 0;
  const tradeoffParts = currentLesson.tradeoff.split(" but ");
  const hasBut = tradeoffParts.length >= 2;

  return (
    <>
      <div
        style={{ width: `${readProgress}%` }}
        className="fixed top-0 left-0 h-[2px] bg-[#4ade80] z-50 transition-all duration-100"
        aria-hidden
      />

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lesson-block {
          opacity: 0;
          animation: fadeSlideIn 300ms ease forwards;
        }
        .lesson-block-1 { animation-delay: 0ms; }
        .lesson-block-2 { animation-delay: 400ms; }
        .lesson-block-3 { animation-delay: 800ms; }
        .lesson-block-4 { animation-delay: 1200ms; }
        .lesson-block-5 { animation-delay: 1600ms; }
        .unlock-block-1 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 0ms; }
        .unlock-block-2 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 300ms; }
        .unlock-block-3 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 600ms; }
        .unlock-block-4 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 900ms; }
        .unlock-block-5 { opacity: 0; animation: fadeSlideIn 300ms ease forwards; animation-delay: 1200ms; }
      `}</style>

      <div className="min-h-screen bg-[#0a0a0a] font-mono px-6 py-12 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => router.push("/learn/overview")}
          className="text-sm text-neutral-600 hover:text-neutral-400 mb-6 focus:outline-none"
        >
          ← overview
        </button>

        <p className="text-sm text-neutral-600 mb-2">
          // growth_os · learn · day_{currentLesson.dayNumber}
        </p>
        <h1 className="text-2xl text-neutral-200 mb-2">{currentLesson.title}</h1>
        <p className="text-sm text-neutral-600 mb-8">
          // {formatConceptType(currentLesson.conceptType)} · {currentLesson.estimatedMinutes} min
          · lesson {currentLessonIndex + 1} of {totalLessons}
        </p>

        <div className="flex items-center gap-2 mb-10 text-sm">
          <span className="text-[#4ade80] border border-[#4ade80] px-2 py-0.5">[learn]</span>
          <span className="text-neutral-600">────────</span>
          <span className="text-neutral-600 border border-neutral-700 px-2 py-0.5">[defend]</span>
          <span className="text-neutral-600">────────</span>
          <span className="text-neutral-600 border border-neutral-700 px-2 py-0.5">[unlock]</span>
        </div>

        <div className="space-y-8">
          <div className="lesson-block lesson-block-1 border-l-2 border-[#4ade80] pl-4">
            <p className="text-sm text-neutral-600 mb-2">// hook</p>
            <p className="text-lg text-neutral-200 leading-relaxed">{currentLesson.hook}</p>
          </div>

          <div className="lesson-block lesson-block-2">
            <p className="text-sm text-neutral-600 mb-2">// context</p>
            <p className="text-neutral-200 leading-relaxed">{currentLesson.context}</p>
          </div>

          <div className="lesson-block lesson-block-3 bg-neutral-900 p-4">
            <p className="text-sm text-neutral-600 mb-2">// core_insight</p>
            <p className="text-neutral-200 leading-relaxed">{currentLesson.coreInsight}</p>
          </div>

          <div className="lesson-block lesson-block-4">
            <p className="text-sm text-neutral-600 mb-2">// tradeoff</p>
            <p className="text-neutral-200 leading-relaxed">
              {hasBut ? (
                <>
                  {tradeoffParts[0]}
                  <span className="text-[#4ade80]"> but </span>
                  {tradeoffParts.slice(1).join(" but ")}
                </>
              ) : (
                currentLesson.tradeoff
              )}
            </p>
          </div>

          <div className="lesson-block lesson-block-5">
            <p className="text-sm text-neutral-600 mb-2">
              // why_this_matters · {formatRole(targetRole)}
            </p>
            <p className="text-sm text-neutral-400 italic leading-relaxed">
              {currentLesson.roleRelevanceNote}
            </p>
          </div>
        </div>

        <div
          className={`mt-12 transition-opacity duration-500 ${
            continueVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={() => setLessonPhase(currentLessonIndex, "DEFEND")}
            className="w-full font-mono text-[#4ade80] border border-[#4ade80] bg-transparent py-2 transition-all duration-150 hover:bg-[#4ade80] hover:text-black focus:outline-none"
          >
            [ i understand · begin defence → ]
          </button>
        </div>
      </div>
    </>
  );
}
