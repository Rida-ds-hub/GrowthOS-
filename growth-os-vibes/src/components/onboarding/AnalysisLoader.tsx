"use client"

import { useState, useEffect, useRef, useMemo } from "react"

interface AnalysisLoaderProps {
  stage?: string
  targetRole?: string
}

/* ── STAGE CONFIG ── */
const STAGE_KEYS = ["connect","github","resume","linkedin","website","ai","plan","complete"]
const STAGE_META: Record<string, { label: string; pct: number; src: number; nodes: number; gaps: string }> = {
  connect:  { label: "Initializing engine",     pct: 5,   src: 0, nodes: 0,  gaps: "\u2014" },
  github:   { label: "Scanning GitHub",          pct: 18,  src: 1, nodes: 4,  gaps: "\u2014" },
  resume:   { label: "Parsing career data",      pct: 30,  src: 2, nodes: 9,  gaps: "\u2014" },
  linkedin: { label: "Processing LinkedIn",      pct: 42,  src: 3, nodes: 14, gaps: "\u2014" },
  website:  { label: "Crawling web presence",    pct: 52,  src: 4, nodes: 18, gaps: "\u2014" },
  ai:       { label: "Running gap analysis",     pct: 67,  src: 4, nodes: 23, gaps: "..." },
  plan:     { label: "Building your roadmap",    pct: 92,  src: 4, nodes: 23, gaps: "12" },
  complete: { label: "Analysis complete",         pct: 100, src: 4, nodes: 23, gaps: "12" },
}

/* ── GRAPH DATA ── */
const NODES = [
  { id:0,  lbl:"github",       grp:"input",  bx:-220, by:-90,  bz:55,   sl:1 },
  { id:1,  lbl:"linkedin",     grp:"input",  bx:-235, by:35,   bz:-35,  sl:3 },
  { id:2,  lbl:"resume",       grp:"input",  bx:-195, by:130,  bz:70,   sl:2 },
  { id:3,  lbl:"portfolio",    grp:"input",  bx:-205, by:-190, bz:-45,  sl:4 },
  { id:4,  lbl:"gap analysis", grp:"core",   bx:-45,  by:-22,  bz:0,    sl:5 },
  { id:5,  lbl:"roadmap",      grp:"core",   bx:25,   by:75,   bz:25,   sl:6 },
  { id:6,  lbl:"daily engine", grp:"core",   bx:0,    by:-108, bz:-15,  sl:5 },
  { id:7,  lbl:"memory",       grp:"core",   bx:62,   by:10,   bz:45,   sl:5 },
  { id:8,  lbl:"sys design",   grp:"skill",  bx:148,  by:-162, bz:-25,  sl:5 },
  { id:9,  lbl:"open source",  grp:"skill",  bx:192,  by:-84,  bz:62,   sl:5 },
  { id:10, lbl:"leadership",   grp:"skill",  bx:130,  by:-44,  bz:-58,  sl:5 },
  { id:11, lbl:"commits",      grp:"skill",  bx:170,  by:-222, bz:15,   sl:5 },
  { id:12, lbl:"li posts",     grp:"brand",  bx:218,  by:52,   bz:-25,  sl:6 },
  { id:13, lbl:"resume upd",   grp:"brand",  bx:178,  by:142,  bz:45,   sl:6 },
  { id:14, lbl:"promo case",   grp:"brand",  bx:148,  by:228,  bz:-15,  sl:6 },
  { id:15, lbl:"1:1 notes",    grp:"ops",    bx:108,  by:282,  bz:55,   sl:6 },
  { id:16, lbl:"standups",     grp:"ops",    bx:45,   by:338,  bz:-25,  sl:6 },
  { id:17, lbl:"calendar",     grp:"ops",    bx:-5,   by:278,  bz:65,   sl:5 },
  { id:18, lbl:"readiness",    grp:"signal", bx:272,  by:0,    bz:0,    sl:6 },
  { id:19, lbl:"promotion",    grp:"output", bx:328,  by:-75,  bz:-25,  sl:7 },
  { id:20, lbl:"pivot",        grp:"output", bx:332,  by:20,   bz:45,   sl:7 },
  { id:21, lbl:"new role",     grp:"output", bx:318,  by:95,   bz:-15,  sl:7 },
  { id:22, lbl:"found",        grp:"output", bx:308,  by:168,  bz:35,   sl:7 },
]
const EDGES: [number, number][] = [
  [0,4],[1,4],[2,4],[3,4],[4,5],[4,6],[4,7],
  [5,8],[5,9],[5,10],[5,11],[6,8],[6,9],[6,11],
  [7,15],[7,16],[7,17],[7,13],[7,14],
  [8,18],[9,18],[10,18],[10,12],[11,13],
  [15,14],[16,14],[17,15],
  [12,18],[13,18],[14,18],
  [18,19],[18,20],[18,21],[18,22],
]
const GRP_SZ: Record<string, number> = { input:5, core:7.5, skill:4, brand:4, ops:3.5, signal:6, output:5.5 }

/* ── CHAOS QUESTIONS ── */
const CHAOS_QS = [
  { q: "\u201cAm I actually senior enough yet?\u201d",        r: "\u2713 Seniority gap: mapped.",        at: 2 },
  { q: "\u201cShould I have switched jobs already?\u201d",    r: "\u2713 Timing signal: calculated.",    at: 3 },
  { q: "\u201cIs my LinkedIn even worth looking at?\u201d",   r: "\u2713 Brand presence: scored.",       at: 5 },
  { q: "\u201cWhy hasn\u2019t anyone noticed my work?\u201d", r: "\u2713 Visibility gaps: found.",       at: 5 },
  { q: "\u201cDo I have what it takes to lead?\u201d",        r: "\u2713 Leadership delta: quantified.", at: 6 },
]

const DOMAINS = ["System Design", "Execution", "Communication", "Tech Depth", "Leadership"]
const SRC_LABELS = ["GitHub", "LinkedIn", "Resume", "Portfolio"]

const INSIGHTS = [
  "Most people guess. You\u2019re about to know.",
  "Mapping your career DNA\u2026",
  "Finding the gaps others miss.",
  "Your 90-day roadmap is taking shape.",
  "Precision over guesswork. Always.",
  "Analyzing across five career dimensions.",
  "Cross-referencing with industry benchmarks.",
  "Almost there\u2026 quality takes a moment.",
]

/* ── 3D math ── */
function ry(v: number[], a: number): number[] {
  return [v[0]*Math.cos(a)+v[2]*Math.sin(a), v[1], -v[0]*Math.sin(a)+v[2]*Math.cos(a)]
}
function rx(v: number[], a: number): number[] {
  return [v[0], v[1]*Math.cos(a)-v[2]*Math.sin(a), v[1]*Math.sin(a)+v[2]*Math.cos(a)]
}

/* ════════════════════════════════════════════════════ */
export function AnalysisLoader({
  stage = "connect",
  targetRole = "your target role",
}: AnalysisLoaderProps) {
  /* ── Refs ── */
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const autoRotRef = useRef(0)
  const lastFrameRef = useRef(performance.now())
  const stageStartRef = useRef(Date.now())
  const stageIdxRef = useRef(0) // avoid stale closure in canvas loop

  /* ── State ── */
  const [elapsed, setElapsed] = useState(0)
  const [liveProgress, setLiveProgress] = useState(5)
  const [domainScans, setDomainScans] = useState([0, 0, 0, 0, 0])
  const [insightIdx, setInsightIdx] = useState(0)

  const stageIdx = STAGE_KEYS.indexOf(stage)
  const meta = STAGE_META[stage] || STAGE_META.connect
  const isComplete = stage === "complete"
  const showSignal = stageIdx >= 5

  /* ── Keep stageIdxRef in sync ── */
  useEffect(() => {
    stageIdxRef.current = stageIdx
    stageStartRef.current = Date.now()
  }, [stageIdx])

  /* ── Elapsed timer ── */
  useEffect(() => {
    const iv = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  /* ── Progress: asymptotic creep during AI, snap for others ── */
  useEffect(() => {
    if (stage === "ai") {
      setLiveProgress(67)
      const iv = setInterval(() => {
        const t = (Date.now() - stageStartRef.current) / 1000
        const p = 67 + 22 * (1 - 1 / (1 + t / 12))
        setLiveProgress(Math.min(p, 89.5))
      }, 200)
      return () => clearInterval(iv)
    }
    setLiveProgress(meta.pct)
  }, [stage, meta.pct])

  /* ── Insight cycling ── */
  useEffect(() => {
    const iv = setInterval(() => setInsightIdx(i => (i + 1) % INSIGHTS.length), 3500)
    return () => clearInterval(iv)
  }, [])

  /* ── Domain bars: wave animation that never stalls ── */
  useEffect(() => {
    if (stage === "ai" || stage === "plan") {
      const iv = setInterval(() => {
        const t = (Date.now() - stageStartRef.current) / 1000
        setDomainScans(prev =>
          prev.map((v, i) => {
            if (stage === "plan") return Math.min(v + 1.2, 96)
            const base = 40 + 35 * (1 - 1 / (1 + t / 15))
            const off = i * 7
            const wave = Math.sin(t * 0.4 + i * 1.2) * 4
            const target = base + off + wave
            return Math.min(v + 0.2 + Math.random() * 0.5, Math.max(v, target))
          })
        )
      }, 80)
      return () => clearInterval(iv)
    }
    if (stage === "complete") setDomainScans([100, 100, 100, 100, 100])
  }, [stage])

  /* ── Canvas graph — runs once, reads stageIdxRef ── */
  useEffect(() => {
    const canvasEl = canvasRef.current
    const zone = topRef.current
    if (!canvasEl || !zone) return
    const ctx2d = canvasEl.getContext("2d")
    if (!ctx2d) return

    let running = true

    const resize = () => {
      canvasEl.width = zone.clientWidth
      canvasEl.height = zone.clientHeight
    }
    resize()
    window.addEventListener("resize", resize)

    function nodeBright(n: typeof NODES[0]): number {
      const now = Date.now()
      const f = Math.sin(now * 0.0009 + n.id * 1.2) * 0.06
      const si = stageIdxRef.current
      if (si >= 7) return 0.92 + f
      if (si >= n.sl) return 0.75 + f
      return 0.06 + Math.sin(now * 0.0004 + n.id * 0.9) * 0.03
    }

    function draw() {
      if (!running || !canvasEl || !ctx2d) return
      const W = canvasEl.width, H = canvasEl.height
      const now = performance.now()
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05)
      lastFrameRef.current = now
      autoRotRef.current += dt * 0.025

      ctx2d.clearRect(0, 0, W, H)

      const ROY = autoRotRef.current
      const ROX = Math.sin(now * 0.00015) * 0.02
      const CX = W * 0.5, CY = H * 0.52
      const FOV = 560, CAM = 820, SC = 0.6

      type ProjNode = { sx: number; sy: number; sz: number; s: number; br: number; node: typeof NODES[0] }
      const proj: (ProjNode | null)[] = NODES.map(n => {
        let v = [n.bx * SC, n.by * SC, n.bz * SC]
        v = ry(v, ROY)
        v = rx(v, ROX)
        const dz = v[2] + CAM
        if (dz < 1) return null
        const s = FOV / dz
        return { sx: CX + v[0] * s, sy: CY + v[1] * s, sz: dz, s, br: nodeBright(n), node: n }
      })

      // Edges
      EDGES.forEach(([ai, bi]) => {
        const a = proj[ai], b = proj[bi]
        if (!a || !b) return
        const br = Math.min(a.br, b.br)
        if (br < 0.03) return
        ctx2d.beginPath()
        ctx2d.moveTo(a.sx, a.sy)
        ctx2d.lineTo(b.sx, b.sy)
        ctx2d.strokeStyle = `rgba(16,185,129,${br * 0.28})`
        ctx2d.lineWidth = br > 0.6 ? 0.9 : 0.45
        ctx2d.stroke()
      })

      // Nodes sorted back-to-front
      const sorted = (proj.filter(Boolean) as ProjNode[]).sort((a, b) => b.sz - a.sz)
      for (const p of sorted) {
        const { sx, sy, s, br, node } = p
        const r = Math.max(1.5, (GRP_SZ[node.grp] || 4) * s * 0.9) * (0.55 + br * 0.45)

        if (br > 0.25) {
          const g = ctx2d.createRadialGradient(sx, sy, 0, sx, sy, r * 6)
          g.addColorStop(0, `rgba(16,185,129,${br * 0.13})`)
          g.addColorStop(1, "transparent")
          ctx2d.beginPath()
          ctx2d.arc(sx, sy, r * 6, 0, Math.PI * 2)
          ctx2d.fillStyle = g
          ctx2d.fill()
        }

        ctx2d.beginPath()
        ctx2d.arc(sx, sy, r, 0, Math.PI * 2)
        ctx2d.fillStyle = node.grp === "core"
          ? `rgba(240,240,240,${0.08 + br * 0.92})`
          : `rgba(16,185,129,${0.06 + br * 0.82})`
        ctx2d.fill()

        if (br > 0.42 && s > 0.28) {
          const la = Math.min(1, (br - 0.42) * 4) * Math.min(1, (s - 0.28) * 6)
          if (la > 0.06) {
            const fs = Math.max(8, Math.min(12, s * 15))
            ctx2d.font = `${fs}px JetBrains Mono`
            ctx2d.fillStyle = node.grp === "core"
              ? `rgba(240,240,240,${la})`
              : `rgba(110,231,183,${la * 0.82})`
            ctx2d.fillText(node.lbl, sx + r + 3, sy + 4)
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener("resize", resize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Log entries ── */
  const logEntries = useMemo(() => {
    const labels: Record<string, string> = {
      connect:  "Initializing analysis engine",
      github:   "Scanning repos & contributions",
      resume:   "Extracting skills from resume",
      linkedin: "Processing professional history",
      website:  "Crawling personal website",
      ai:       `Mapping gaps to ${targetRole}`,
      plan:     "Generating 90-day plan",
      complete: "Preparing your results",
    }
    return STAGE_KEYS.slice(0, stageIdx + 1).map((key, i) => ({
      text: labels[key],
      done: i < stageIdx,
    }))
  }, [stageIdx, targetRole])

  const displayPct = Math.round(liveProgress)
  const fmtTime = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`

  return (
    <div className="al-root">
      {/* ── Progress bar (top) ── */}
      <div className="al-progress-bar">
        <div className="al-progress-fill" style={{ width: `${liveProgress}%` }} />
      </div>

      {/* ── Top zone: graph ── */}
      <div className="al-top" ref={topRef}>
        <canvas ref={canvasRef} className="al-canvas" />
        <div className="al-fade" />
        <div className="al-topbar">
          <div className="al-tb-logo">
            growth<span className="al-g">_os</span>
          </div>
          <div className="al-tb-status">
            <div className="al-pulse-dot" />
            <span>{meta.label}</span>
          </div>
          <div className="al-src-dots">
            {SRC_LABELS.map((_, i) => (
              <div key={i} className={`al-src-dot${i < meta.src ? " on" : ""}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom zone ── */}
      <div className="al-bottom">
        <div className="al-grid">
          {/* Left: log */}
          <div className="al-col">
            <div className="al-col-label">{"// analysis log"}</div>
            <div>
              {logEntries.map((entry, i) => (
                <div key={i} className={`al-log-entry${i <= stageIdx ? " vis" : ""}`}>
                  <span className="al-log-dollar">$</span>
                  <span className={`al-log-text${entry.done ? "" : " active"}`}>
                    {entry.text}
                  </span>
                  {entry.done ? (
                    <span className="al-log-check">{"\u2713"}</span>
                  ) : (
                    <span className="al-log-blink">{"\u25CF"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center: chaos → signal */}
          <div className="al-col al-center-col">
            <div className={`al-chaos${showSignal ? " hidden" : ""}`}>
              {CHAOS_QS.map((cq, i) => {
                const visible = stageIdx >= i
                const resolved = stageIdx >= cq.at
                return (
                  <div
                    key={i}
                    className={`al-chaos-q${visible ? " vis" : ""}${resolved ? " answered" : " active"}`}
                  >
                    {resolved ? cq.r : cq.q}
                  </div>
                )
              })}
            </div>
            <div className={`al-signal${showSignal ? " vis" : ""}`}>
              <div className="al-sig-stage">{meta.label}</div>
              <div className="al-sig-pct">{displayPct}%</div>
              <div className="al-sig-sub">
                {isComplete
                  ? `Your roadmap to ${targetRole} is ready.`
                  : INSIGHTS[insightIdx]}
              </div>
            </div>
          </div>

          {/* Right: domains */}
          <div className="al-col">
            <div className="al-col-label">{"// skill domains"}</div>
            <div>
              {DOMAINS.map((name, i) => {
                const val = domainScans[i]
                const active = stageIdx >= 5
                return (
                  <div key={name} className="al-d-item">
                    <div className="al-d-head">
                      <span className={`al-d-name${active ? " active" : ""}`}>{name}</span>
                      <span className={`al-d-val${active ? " active" : ""}`}>
                        {active ? `${Math.round(val)}%` : "\u2014"}
                      </span>
                    </div>
                    <div className="al-d-track">
                      <div className="al-d-fill" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div className="al-footer">
          <div className="al-stat">
            <span className="al-stat-label">Sources</span>
            <span className={`al-stat-val${meta.src > 0 ? " lit" : ""}`}>
              {meta.src} / 4
            </span>
          </div>
          <div className="al-stat">
            <span className="al-stat-label">Nodes</span>
            <span className={`al-stat-val${meta.nodes > 0 ? " lit" : ""}`}>
              {meta.nodes}
            </span>
          </div>
          <div className="al-stat">
            <span className="al-stat-label">Gaps</span>
            <span className={`al-stat-val${meta.gaps !== "\u2014" && meta.gaps !== "..." ? " lit" : ""}`}>
              {meta.gaps}
            </span>
          </div>
          <div className="al-stat">
            <span className="al-stat-label">Elapsed</span>
            <span className="al-stat-val">{fmtTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
