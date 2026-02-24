"use client"

import { useRef, useState, useEffect } from "react"
import { useScroll, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const panels = [
  {
    tag: "Career Progression Engine",
    title: "Stop drifting.\nStart operating.",
    highlight: "operating.",
    description: "Most engineers are talented and stuck. Growth OS connects your GitHub, LinkedIn, resume, and calendar into one living system that tells you exactly what to do next and when you are ready to move.",
    cta: "Get Early Access",
    ctaSecondary: "See How It Works",
  },
  {
    tag: "01 // Gap Analysis",
    title: "We find the\nexact gap.",
    highlight: "exact gap.",
    description: "Connect your GitHub, LinkedIn, resume, and portfolio. Growth OS reads your actual trajectory and surfaces the precise delta between where you are and the role, level, or path you are targeting.",
    progress: [
      { label: "System Design", value: 38 },
      { label: "Brand Presence", value: 15 },
      { label: "Leadership Signal", value: 22 },
      { label: "Stakeholder Comms", value: 48 },
    ],
  },
  {
    tag: "02 // Daily Engine",
    title: "15 minutes.\nCompounds daily.",
    highlight: "Compounds daily.",
    description: "Micro-learning tied to your actual gaps. In-app code commits. System thinking exercises. Calendar-integrated meeting logs. Every action feeds the machine and moves your readiness score forward.",
    terminal: true,
  },
  {
    tag: "03 // Brand Engine",
    title: "Your work,\nseen by the right people.",
    highlight: "seen by the right people.",
    description: "Every merged PR becomes a resume bullet. Every 1:1 becomes evidence for your promotion case. Every week of progress becomes a LinkedIn post. Real work. Real signal. No cringe.",
    terminal: true,
  },
  {
    tag: "04 // The Jump Signal",
    title: "You will know\nexactly when to move.",
    highlight: "exactly when to move.",
    description: "Promotion. Pivot. New role. Founding something. Growth OS tracks your readiness signal across all domains. When the data says you are ready, it tells you. No more guessing. No more waiting too long.",
    terminal: true,
    cta: "Start My Journey",
  },
]

export function StickyHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [activePanel, setActivePanel] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Calculate which panel should be active based on scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const panelIndex = Math.min(
        Math.floor(latest * panels.length),
        panels.length - 1
      )
      setActivePanel(panelIndex)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  const handleCTAClick = () => {
    router.push("/onboarding")
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: "600vh" }}>
      <div className="sticky top-0 h-screen flex items-center z-10 pointer-events-none">
        <div className="absolute left-16 max-w-[420px] pointer-events-auto">
          {panels.map((panel, index) => {
            const isActive = activePanel === index

            return (
              <motion.div
                key={index}
                className="absolute inset-0 w-full"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(16px)",
                  pointerEvents: isActive ? "auto" : "none",
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-[0.7rem] mb-4">
                  <div className="w-5 h-px bg-emerald-500" />
                  <span className="text-[0.63rem] tracking-[0.35em] uppercase text-emerald-500">
                    {panel.tag}
                  </span>
                </div>

                {index === 0 ? (
                  <h1 className="font-['var(--font-jetbrains-mono)'] text-[clamp(2.4rem,4vw,3.8rem)] font-bold leading-[1.0] mb-4 text-white tracking-[-0.03em]">
                    Stop drifting.
                    <br />
                    Start <span className="text-emerald-500">operating.</span>
                  </h1>
                ) : (
                  <h2 className="font-['var(--font-jetbrains-mono)'] text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-[1.05] mb-[0.9rem] text-white tracking-[-0.03em]">
                    {panel.title.split("\n").map((line, i) => (
                      <span key={i}>
                        {line.split(" ").map((word, j) => {
                          const isHighlight = word.includes(panel.highlight.replace(".", "")) || 
                                            word === panel.highlight || 
                                            word === panel.highlight.replace(".", "")
                          return (
                            <span
                              key={j}
                              className={isHighlight ? "text-emerald-500" : ""}
                            >
                              {word}{" "}
                            </span>
                          )
                        })}
                        {i < panel.title.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </h2>
                )}

                <p className="text-[0.85rem] leading-[2] text-[#a1a1aa] font-light mb-[1.4rem] max-w-[380px]">
                  {panel.description}
                </p>

                {panel.progress && (
                  <div className="flex flex-col gap-[0.4rem] mb-[1.4rem]">
                    {panel.progress.map((item, i) => (
                      <div key={i} className="flex items-center gap-[0.7rem] text-[0.7rem] text-zinc-500">
                        <span className="min-w-0 flex-shrink-0">
                          {item.label}
                        </span>
                        <div className="flex-1 h-0.5 bg-[#27272a] relative overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                          />
                        </div>
                        <span className="text-emerald-500 min-w-[28px] text-right flex-shrink-0">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {panel.progress && (
                  <p className="text-[0.74rem] text-zinc-500">
                    {"// Real gaps. Real data. Zero guesswork."}
                  </p>
                )}

                {panel.terminal && (
                  <div className="bg-[#111111] border border-[#1e1e1e] p-[1.1rem_1.3rem] mb-[1.4rem] relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-emerald-500" />
                    <div className="flex gap-1.5 mb-3">
                      <div className="w-[7px] h-[7px] rounded-full bg-[#ff5f57]" />
                      <div className="w-[7px] h-[7px] rounded-full bg-[#febc2e]" />
                      <div className="w-[7px] h-[7px] rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[0.73rem] leading-[2.2] text-zinc-500 font-mono">
                      {index === 2 && (
                        <>
                          <div>
                            <span className="text-emerald-500">$ </span>
                            <span className="text-[#a1a1aa]">day_47.log</span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              Micro-lesson: System design tradeoffs ...{" "}
                            </span>
                            <span className="text-emerald-500">done</span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              PR #482 merged, resume updated ..........{" "}
                            </span>
                            <span className="text-emerald-500">done</span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              1:1 with Priya logged ...................{" "}
                            </span>
                            <span className="text-emerald-500">done</span>
                          </div>
                          <div>
                            <span className="text-[#e8a838]">Readiness score: </span>
                            <span className="text-emerald-500">65% (+3 today)</span>
                          </div>
                        </>
                      )}
                      {index === 3 && (
                        <>
                          <div>
                            <span className="text-[#e8a838]">PR #482 merged</span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              Resume bullet generated ...{" "}
                            </span>
                            <span className="text-emerald-500">done</span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              LinkedIn draft ready ......{" "}
                            </span>
                            <span className="text-emerald-500">done</span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              Promo narrative updated ...{" "}
                            </span>
                            <span className="text-emerald-500">done</span>
                          </div>
                          <div>
                            <span className="text-emerald-500">$ </span>
                            <span className="inline-block w-[5px] h-[11px] bg-emerald-500 align-middle animate-pulse" />
                          </div>
                        </>
                      )}
                      {index === 4 && (
                        <>
                          <div>
                            <span className="text-[#e8a838]">
                              Signal check: Alex Chen, Day 90
                            </span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              Skill readiness ........{" "}
                            </span>
                            <span className="text-emerald-500">84%</span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              Brand signal ...........{" "}
                            </span>
                            <span className="text-emerald-500">73%</span>
                          </div>
                          <div>
                            <span className="text-[#a1a1aa]">
                              Evidence portfolio .....{" "}
                            </span>
                            <span className="text-emerald-500">91%</span>
                          </div>
                          <div className="mt-1 pt-1.5 border-t border-[#1e1e1e]">
                            <span className="text-emerald-500">
                              READY. Time to make your move.
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {index === 0 && (
                  <div className="flex gap-[0.75rem] flex-wrap">
                    {panel.cta && (
                      <Button
                        onClick={handleCTAClick}
                        className="bg-emerald-500 text-[#0a0a0a] hover:opacity-80 font-['var(--font-jetbrains-mono)'] font-bold text-[0.72rem] tracking-[0.15em] uppercase px-[1.7rem] py-[0.82rem] border-none transition-opacity"
                      >
                        {panel.cta}
                      </Button>
                    )}
                    {panel.ctaSecondary && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          document.getElementById("how")?.scrollIntoView({
                            behavior: "smooth",
                          })
                        }}
                        className="border-[#1e1e1e] text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30 font-['var(--font-jetbrains-mono)'] font-bold text-[0.72rem] tracking-[0.15em] uppercase px-[1.4rem] py-[0.82rem] bg-transparent transition-all"
                      >
                        {panel.ctaSecondary}
                      </Button>
                    )}
                  </div>
                )}
                {index === 4 && panel.cta && (
                  <div className="flex gap-[0.75rem] flex-wrap mt-[1.2rem]">
                    <Button
                      onClick={handleCTAClick}
                      className="bg-emerald-500 text-[#0a0a0a] hover:opacity-80 font-['var(--font-jetbrains-mono)'] font-bold text-[0.72rem] tracking-[0.15em] uppercase px-[1.7rem] py-[0.82rem] border-none transition-opacity"
                    >
                      {panel.cta}
                    </Button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-16 text-[0.6rem] tracking-[0.3em] uppercase text-zinc-500 flex items-center gap-[0.6rem] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <div className="w-px h-[30px] bg-gradient-to-b from-emerald-500 to-transparent" />
          scroll to explore
        </motion.div>
      </div>
    </div>
  )
}
