"use client"

import { GapAnalysis } from "@/lib/types"

interface ResultsReportProps {
  gapAnalysis: GapAnalysis
  targetRole: string
  timeline?: string
  generatedDate: string
  dataSources: {
    githubData?: string | null
    linkedinData?: string | null
    resumeText?: string | null
    websiteUrl?: string | null
  }
}

const DOMAINS_IN_ORDER: Array<keyof GapAnalysis["domainScores"]> = [
  "System Design Maturity",
  "Execution Scope",
  "Communication & Visibility",
  "Technical Depth",
  "Leadership & Influence",
]

const getDomainBadge = (score: number) => {
  if (score >= 70) {
    return { label: "Strong", color: "#16a34a", bg: "#ecfdf3" }
  }
  if (score >= 40) {
    return { label: "Moderate", color: "#d97706", bg: "#fef9c3" }
  }
  return { label: "Needs work", color: "#dc2626", bg: "#fee2e2" }
}

const formatGapLabel = (gap: string | undefined) => {
  if (!gap) return "Gap"
  if (gap === "high") return "High gap"
  if (gap === "medium") return "Moderate gap"
  if (gap === "low") return "Low gap"
  return gap
}

export function ResultsReport({
  gapAnalysis,
  targetRole,
  timeline,
  generatedDate,
  dataSources,
}: ResultsReportProps) {
  const domainScores = gapAnalysis.domainScores || {}
  const gapsByDomain = new Map<string, (typeof gapAnalysis.gaps)[number]>()

  ;(gapAnalysis.gaps || []).forEach((gap) => {
    gapsByDomain.set(gap.domain, gap)
  })

  const readinessScore = gapAnalysis.readinessScore ?? 0

  const ds = dataSources || {}

  return (
    <div
      id="results-report-root"
      className="bg-white text-zinc-900 p-10 w-[900px] mx-auto font-sans"
    >
      {/* Header */}
      <header className="flex items-start justify-between border-b border-zinc-200 pb-5 mb-8">
        <div>
          <div className="font-mono font-semibold tracking-[0.2em] text-sm uppercase text-zinc-600">
            growth<span className="text-emerald-500">_os</span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 mt-2">
            career progression engine
          </div>
        </div>
        <div className="text-right text-sm text-zinc-500 leading-relaxed">
          <div>Generated: {generatedDate}</div>
          <div>Timeline: {timeline || "Not specified"}</div>
        </div>
      </header>

      {/* Title / meta */}
      <section className="mb-8">
        <h1 className="font-mono text-2xl font-semibold text-zinc-900 mb-2">
          Gap Analysis Report
        </h1>
        <p className="text-base text-zinc-600">
          Target role: <span className="font-semibold text-zinc-900">{targetRole}</span>
        </p>
      </section>

      {/* Summary + readiness */}
      <section className="mb-8">
        <h2 className="text-[12px] tracking-[0.25em] uppercase text-zinc-500 mb-3">
          Summary
        </h2>
        <div className="border border-zinc-200 rounded-2xl px-5 py-4 flex gap-6 items-start">
          <div className="flex-1 text-[15px] leading-relaxed text-zinc-800">
            {gapAnalysis.summary || "No summary available."}
          </div>
          <div className="flex flex-col items-center justify-center min-w-[140px]">
            <div className="text-[12px] uppercase tracking-[0.22em] text-zinc-500 mb-2">
              Readiness
            </div>
            <div className="font-mono text-4xl font-semibold text-amber-500 leading-none">
              {readinessScore}
            </div>
            <div className="text-[11px] text-zinc-500 mt-2">out of 100</div>
          </div>
        </div>
      </section>

      {/* Data sources */}
      <section className="mb-8">
        <h2 className="text-[12px] tracking-[0.25em] uppercase text-zinc-500 mb-3">
          Data sources used
        </h2>
        <div className="flex flex-wrap gap-3 text-[12px]">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
              ds.githubData
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 text-zinc-500"
            }`}
          >
            ⌥ GitHub {ds.githubData ? "· connected" : "· not provided"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
              ds.resumeText
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 text-zinc-500"
            }`}
          >
            ≡ Resume {ds.resumeText ? "· connected" : "· not provided"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
              ds.linkedinData
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 text-zinc-500"
            }`}
          >
            in LinkedIn{" "}
            {ds.linkedinData ? "· provided" : "· requires sign in"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
              ds.websiteUrl
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 text-zinc-500"
            }`}
          >
            ⊕ Personal site{" "}
            {ds.websiteUrl ? "· URL provided" : "· not provided"}
          </span>
        </div>
      </section>

      {/* Domain scores */}
      <section className="mb-8">
        <h2 className="text-[12px] tracking-[0.25em] uppercase text-zinc-500 mb-4">
          Score breakdowns
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {DOMAINS_IN_ORDER.map((domainKey) => {
            const score = domainScores[domainKey] ?? 0
            const badge = getDomainBadge(score)
            return (
              <div
                key={domainKey}
                className="border border-zinc-200 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-[13px] text-zinc-700">{domainKey}</div>
                  <div className="mt-1 inline-flex items-center gap-2 text-[11px]">
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-2xl font-semibold text-zinc-900">
                  {score}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Gap details */}
      <section className="mb-8">
        <h2 className="text-[12px] tracking-[0.25em] uppercase text-zinc-500 mb-4">
          Gap details by domain
        </h2>
        <div className="space-y-4 text-sm">
          {DOMAINS_IN_ORDER.map((domainKey, index) => {
            const score = domainScores[domainKey] ?? 0
            const badge = getDomainBadge(score)
            const gap = gapsByDomain.get(domainKey) || null

            return (
              <div
                key={domainKey}
                className="border border-zinc-200 rounded-2xl px-5 py-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 font-mono text-[9px] leading-none">
                        {index + 1}
                      </span>
                      <span>{domainKey}</span>
                    </div>
                    <div className="text-[14px] text-zinc-800">
                      {gap?.title || formatGapLabel(gap?.gap)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-semibold text-zinc-900">
                      {score}
                    </div>
                    <div
                      className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
                      Evidence shows
                    </div>
                    <p className="text-[14px] text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {gap?.observation || "No detailed evidence available."}
                    </p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
                      Role expects
                    </div>
                    <p className="text-[14px] text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {gap?.requirement || "Target role requires proficiency in this domain."}
                    </p>
                  </div>
                </div>

                <div className="mt-3 border-t border-zinc-200 pt-2">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 mb-1">
                    Next move
                  </div>
                  <p className="text-[14px] text-emerald-800 whitespace-pre-wrap leading-relaxed">
                    {gap?.closingAction || "Focus on building skills in this area."}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3-Phase plan */}
      <section className="mb-8">
        <h2 className="text-[12px] tracking-[0.25em] uppercase text-zinc-500 mb-4">
          3-phase plan ({timeline || "timeline not specified"})
        </h2>
        <div className="space-y-4 text-sm">
          {["phase1", "phase2", "phase3"].map((key, idx) => {
            const phase: any = (gapAnalysis.plan as any)[key]
            if (!phase) return null

            const actions = (phase.actions || []) as string[]

            return (
              <div
                key={key}
                className="border border-zinc-200 rounded-2xl px-5 py-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
                      Phase {idx + 1}
                    </div>
                    <div className="font-semibold text-[14px] text-zinc-900">
                      {phase.theme || phase.label}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {phase.months || ""}
                  </div>
                </div>
                {actions.length > 0 && (
                  <ul className="mt-2 space-y-1.5 text-[14px] text-zinc-700 leading-relaxed">
                    {actions.slice(0, 5).map((a, i) => (
                      <li key={i}>
                        •{" "}
                        {a
                          .replace(/^Task:\s*/i, "")
                          .replace(/^Action:\s*/i, "")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Progression story */}
      <section className="mb-6">
        <h2 className="text-[12px] tracking-[0.25em] uppercase text-zinc-500 mb-3">
          Progression story
        </h2>
        <div className="border border-zinc-200 rounded-2xl px-5 py-4 text-[14px] text-zinc-800 whitespace-pre-wrap leading-relaxed">
          {gapAnalysis.promotionNarrative || "No narrative available."}
        </div>
      </section>

      <footer className="mt-6 pt-3 border-t border-zinc-200 text-[11px] text-zinc-500 flex justify-between">
        <span>Generated by Growth OS</span>
        <span>{generatedDate}</span>
      </footer>
    </div>
  )
}

