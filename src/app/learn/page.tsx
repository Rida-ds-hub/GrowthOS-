"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLessonPlan } from "@/hooks/useLessonPlan";

const ROLE_OPTIONS: { label: string; value: string }[] = [
  { label: "Software Engineer", value: "SOFTWARE_ENGINEER" },
  { label: "ML Engineer", value: "ML_ENGINEER" },
  { label: "Data Scientist", value: "DATA_SCIENTIST" },
  { label: "Data Analyst", value: "DATA_ANALYST" },
  { label: "Data Engineer", value: "DATA_ENGINEER" },
  { label: "Product Manager", value: "PRODUCT_MANAGER" },
  { label: "DevOps Engineer", value: "DEVOPS_ENGINEER" },
  { label: "Frontend Engineer", value: "FRONTEND_ENGINEER" },
  { label: "Backend Engineer", value: "BACKEND_ENGINEER" },
  { label: "Fullstack Engineer", value: "FULLSTACK_ENGINEER" },
];

const LOADING_LINES = [
  { key: "fetch", label: "fetching repository", dots: 16 },
  { key: "classify", label: "classifying files", dots: 14 },
  { key: "deps", label: "mapping dependencies", dots: 15 },
  { key: "patterns", label: "detecting patterns", dots: 13 },
  { key: "complexity", label: "scoring complexity", dots: 12 },
  { key: "concepts", label: "extracting concepts", dots: 13 },
  { key: "design", label: "generating design decisions", dots: 7 },
  { key: "stubs", label: "building lesson stubs", dots: 10 },
  { key: "questions", label: "generating test questions", dots: 8 },
];

const SPINNER_CHARS = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";

function IdleState({
  url,
  setUrl,
  role,
  setRole,
  urlError,
  setUrlError,
  onSubmit,
  isSubmitting,
}: {
  url: string;
  setUrl: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  urlError: string | null;
  setUrlError: (v: string | null) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const validateUrl = useCallback(() => {
    if (!url.trim()) {
      setUrlError("// url required");
      return false;
    }
    const pathPart = url.trim().replace(/^https:\/\/github\.com\/?/, "").replace(/\/?\?.*$/, "");
    const segments = pathPart.split("/").filter(Boolean);
    if (!url.trim().startsWith("https://github.com/") || segments.length < 2) {
      setUrlError("// must be a github.com/owner/repo url");
      return false;
    }
    setUrlError(null);
    return true;
  }, [url, setUrlError]);

  const handleSubmit = useCallback(() => {
    setUrlError(null);
    if (!url.trim()) {
      setUrlError("// url required");
      return;
    }
    const pathPart = url.trim().replace(/^https:\/\/github\.com\/?/, "").replace(/\/?\?.*$/, "");
    const segments = pathPart.split("/").filter(Boolean);
    if (!url.trim().startsWith("https://github.com/") || segments.length < 2) {
      setUrlError("// must be a github.com/owner/repo url");
      return;
    }
    onSubmit();
  }, [url, setUrlError, onSubmit]);

  return (
    <>
      <p className="text-sm font-mono text-neutral-600 mb-6">// growth_os · learn</p>
      <h1 className="text-2xl font-mono text-neutral-200 mb-8">
        <span className="text-[#4ade80]">&gt;</span> Analyse a repository.
      </h1>

      <div className="mb-6">
        <label htmlFor="github-url" className="block font-mono text-sm text-neutral-400 mb-1">
          $ github_url
        </label>
        <input
          id="github-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={validateUrl}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="https://github.com/owner/repo"
          className="w-full font-mono text-neutral-200 bg-[#0a0a0a] border border-neutral-800 px-3 py-2 focus:border-[#4ade80] focus:outline-none"
          aria-invalid={!!urlError}
          aria-describedby={urlError ? "url-error" : undefined}
        />
        {urlError && (
          <p id="url-error" className="mt-1 font-mono text-sm text-red-500">
            {urlError}
          </p>
        )}
      </div>

      <div className="mb-8">
        <label htmlFor="target-role" className="block font-mono text-sm text-neutral-400 mb-1">
          &gt; target_role
        </label>
        <select
          id="target-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full font-mono text-neutral-200 bg-[#0a0a0a] border border-neutral-800 px-3 py-2 focus:border-[#4ade80] focus:outline-none appearance-none bg-no-repeat pr-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23525252' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundPosition: "right 0.75rem center",
          }}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full font-mono text-[#4ade80] border border-[#4ade80] bg-transparent py-2 transition-all duration-150 hover:bg-[#4ade80] hover:text-black disabled:border-neutral-700 disabled:text-neutral-600 disabled:hover:bg-transparent disabled:hover:text-neutral-600"
      >
        [ run analysis ]
      </button>

      <div className="mt-12 font-mono text-sm text-neutral-600 space-y-0.5">
        <p>// what happens next:</p>
        <p>// 01 · repo is fetched and parsed</p>
        <p>// 02 · architecture is mapped</p>
        <p>// 03 · lessons are generated for your role</p>
        <p>// estimated time: 30–90 seconds</p>
      </div>
    </>
  );
}

function LoadingState({ onCancel }: { onCancel: () => void }) {
  return (
    <>
      <style jsx>{`
        @keyframes learn-line-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes learn-spinner {
          0% { opacity: 1; }
          8.33% { opacity: 0; }
          100% { opacity: 0; }
        }
        .learn-line { opacity: 0; animation: learn-line-in 0.3s ease-out forwards; }
        .learn-line:nth-child(1) { animation-delay: 0s; }
        .learn-line:nth-child(2) { animation-delay: 0.8s; }
        .learn-line:nth-child(3) { animation-delay: 1.6s; }
        .learn-line:nth-child(4) { animation-delay: 2.4s; }
        .learn-line:nth-child(5) { animation-delay: 3.2s; }
        .learn-line:nth-child(6) { animation-delay: 4s; }
        .learn-line:nth-child(7) { animation-delay: 4.8s; }
        .learn-line:nth-child(8) { animation-delay: 6s; }
        .learn-line:nth-child(9) { animation-delay: 7.2s; }
        .learn-spinner-char { position: absolute; animation: learn-spinner 0.96s steps(1) infinite; }
        .learn-spinner-char:nth-child(1) { animation-delay: 0s; }
        .learn-spinner-char:nth-child(2) { animation-delay: -0.08s; }
        .learn-spinner-char:nth-child(3) { animation-delay: -0.16s; }
        .learn-spinner-char:nth-child(4) { animation-delay: -0.24s; }
        .learn-spinner-char:nth-child(5) { animation-delay: -0.32s; }
        .learn-spinner-char:nth-child(6) { animation-delay: -0.4s; }
        .learn-spinner-char:nth-child(7) { animation-delay: -0.48s; }
        .learn-spinner-char:nth-child(8) { animation-delay: -0.56s; }
        .learn-spinner-char:nth-child(9) { animation-delay: -0.64s; }
        .learn-spinner-char:nth-child(10) { animation-delay: -0.72s; }
        .learn-spinner-char:nth-child(11) { animation-delay: -0.8s; }
        .learn-spinner-char:nth-child(12) { animation-delay: -0.88s; }
      `}</style>
      <p className="text-sm font-mono text-neutral-600 mb-6">// growth_os · learn</p>
      <h1 className="text-2xl font-mono text-neutral-200 mb-8">
        <span className="text-[#4ade80]">&gt;</span> running analysis...
      </h1>

      <div className="font-mono text-sm text-neutral-400 space-y-1 mb-8" aria-live="polite">
        {LOADING_LINES.map((line, i) => (
          <div key={line.key} className="learn-line flex items-center gap-0.5">
            <span className="w-32 shrink-0">{line.label}</span>
            <span className="text-neutral-600">
              {".".repeat(line.dots)}
            </span>
            <span className="ml-2 w-6">
              {i < 6 ? (
                <span className="text-[#4ade80]">✓</span>
              ) : (
                <span className="inline-block w-4 h-4 relative text-[#4ade80]">
                  {SPINNER_CHARS.split("").map((char, j) => (
                    <span
                      key={j}
                      className="learn-spinner-char absolute left-0 top-0"
                      style={{ animationDelay: `${-j * 0.08}s` }}
                      aria-hidden
                    >
                      {char}
                    </span>
                  ))}
                  <span className="invisible">{SPINNER_CHARS[0]}</span>
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm font-mono text-neutral-600 mb-2">// this may take up to 90 seconds</p>
      <p className="text-sm font-mono text-neutral-600 mb-4">// do not close this tab</p>

      <button
        type="button"
        onClick={onCancel}
        className="font-mono text-sm text-neutral-500 hover:text-neutral-400 underline focus:outline-none focus:underline"
      >
        // press escape or click here to cancel
      </button>
    </>
  );
}

function ErrorState({
  errorCode,
  errorMessage,
  qualitySignals,
  stage,
  onTryAgain,
  onTryDifferentRepo,
  hasTwoButtons,
}: {
  errorCode: string;
  errorMessage: string;
  qualitySignals: Array<{ name: string; passed: boolean; weight: number; detail: string }> | null;
  stage?: string;
  onTryAgain: () => void;
  onTryDifferentRepo: () => void;
  hasTwoButtons: boolean;
}) {
  const badge =
    errorCode === "REPO_UNTEACHABLE"
      ? "[REPO_UNSUITABLE]"
      : errorCode === "INTERNAL_ERROR"
        ? "[ERROR]"
        : `[${errorCode}]`;

  return (
    <>
      <p className="text-sm font-mono text-neutral-600 mb-6">// growth_os · learn</p>
      <h1 className="text-2xl font-mono text-neutral-200 mb-6">
        <span className="text-[#4ade80]">&gt;</span> analysis failed.
      </h1>

      <div role="alert" className="font-mono text-sm space-y-3 mb-8">
        <p className="text-[#4ade80]">{badge}</p>
        <p className="text-neutral-300">
          {errorCode === "REPO_UNTEACHABLE"
            ? "This repository does not have enough structure to generate lessons."
            : errorCode === "TIMEOUT"
              ? "Analysis took too long. This can happen with very large repositories."
              : errorCode === "INTERNAL_ERROR"
                ? "Something went wrong on our end. Please try again."
                : errorMessage}
        </p>
        {errorCode === "REPO_UNTEACHABLE" && qualitySignals && qualitySignals.length > 0 && (
          <div className="mt-4 space-y-1">
            <p className="text-neutral-600">// quality signals:</p>
            {qualitySignals.map((signal) => (
              <p key={signal.name} className="text-neutral-400">
                {signal.passed ? (
                  <span><span className="text-[#4ade80]">✓</span> {signal.name} · {signal.detail}</span>
                ) : (
                  <span><span className="text-red-500">✗</span> {signal.name} · {signal.detail}</span>
                )}
              </p>
            ))}
            <p className="text-neutral-600 mt-2">// tip: try a repo with clear separation of concerns,</p>
            <p className="text-neutral-600">//      a README, and at least 3 meaningful files.</p>
          </div>
        )}
        {errorCode === "GENERATION_FAILED" && (
          <p className="text-neutral-500">
            {stage
              ? `Lesson generation failed at the ${stage.replace(/_/g, " ").toLowerCase()} stage. `
              : ""}
            This is usually temporary — try again in a moment.
          </p>
        )}
        {errorCode === "TIMEOUT" && (
          <p className="text-neutral-600">// tip: try a smaller repository, or try again — timeouts are often transient.</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onTryAgain}
          className="font-mono text-[#4ade80] border border-[#4ade80] bg-transparent px-4 py-2 transition-all duration-150 hover:bg-[#4ade80] hover:text-black focus:outline-none"
        >
          [ try again ]
        </button>
        {hasTwoButtons && (
          <button
            type="button"
            onClick={onTryDifferentRepo}
            className="font-mono text-neutral-400 border border-neutral-600 bg-transparent px-4 py-2 transition-all duration-150 hover:border-neutral-500 hover:text-neutral-300 focus:outline-none"
          >
            [ try a different repo ]
          </button>
        )}
      </div>
    </>
  );
}

export default function LearnPage() {
  const router = useRouter();
  const { state, fetchLessonPlan, reset } = useLessonPlan();
  type TargetRole = Parameters<typeof fetchLessonPlan>[1];

  const [url, setUrl] = useState("");
  const [role, setRole] = useState<TargetRole>("SOFTWARE_ENGINEER");
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === "READY") {
      router.push("/learn/overview");
    }
  }, [state.status, router]);

  useEffect(() => {
    if (state.status !== "LOADING") return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") reset();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [state.status, reset]);

  const handleSubmit = useCallback(() => {
    setUrlError(null);
    if (!url.trim()) {
      setUrlError("// url required");
      return;
    }
    const pathPart = url.trim().replace(/^https:\/\/github\.com\/?/, "").replace(/\/?\?.*$/, "");
    const segments = pathPart.split("/").filter(Boolean);
    if (!url.trim().startsWith("https://github.com/") || segments.length < 2) {
      setUrlError("// must be a github.com/owner/repo url");
      return;
    }
    fetchLessonPlan(url.trim(), role);
  }, [url, role, fetchLessonPlan]);

  const handleTryDifferentRepo = useCallback(() => {
    reset();
    setUrl("");
    setUrlError(null);
  }, [reset]);

  if (state.status === "LOADING") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] font-mono px-6 py-12 max-w-2xl">
        <LoadingState onCancel={reset} />
      </div>
    );
  }

  if (state.status === "ERROR") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] font-mono px-6 py-12 max-w-2xl">
        <ErrorState
          errorCode={state.errorCode ?? "INTERNAL_ERROR"}
          errorMessage={state.errorMessage ?? "Something went wrong."}
          qualitySignals={state.qualitySignals}
          stage={undefined}
          onTryAgain={reset}
          onTryDifferentRepo={handleTryDifferentRepo}
          hasTwoButtons={state.errorCode === "REPO_UNTEACHABLE"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono px-6 py-12 max-w-2xl">
      <IdleState
        url={url}
        setUrl={setUrl}
        role={role}
        setRole={setRole}
        urlError={urlError}
        setUrlError={setUrlError}
        onSubmit={handleSubmit}
        isSubmitting={state.status === "LOADING"}
      />
    </div>
  );
}
