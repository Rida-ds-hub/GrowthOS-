"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SignUpModal } from "@/components/auth/SignUpModal"
import { Graph3D } from "@/components/landing/Graph3D"

export function LandingPage() {
  const router = useRouter()
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)
  const driverRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activePanel, setActivePanel] = useState(0)
  const [activeHowStep, setActiveHowStep] = useState(1)

  // Cursor effect
  useEffect(() => {
    const cur = document.getElementById('cur')
    const ring = document.getElementById('cur-ring')
    if (!cur || !ring) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }

    document.addEventListener('mousemove', handleMouseMove)

    function animate() {
      if (cur && ring) {
        cur.style.left = mx + 'px'
        cur.style.top = my + 'px'
        rx += (mx - rx) * 0.08
        ry += (my - ry) * 0.08
        ring.style.left = rx + 'px'
        ring.style.top = ry + 'px'
      }
      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Scroll tracking for panels
  useEffect(() => {
    const handleScroll = () => {
      const driver = driverRef.current
      if (!driver) return
      const total = driver.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, -driver.getBoundingClientRect().top / total))
      setScrollProgress(progress)

      const THRESH = [0, 0.18, 0.38, 0.58, 0.78]
      let active = 0
      THRESH.forEach((t, i) => {
        if (progress >= t) active = i
      })
      setActivePanel(active)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGetAccess = (e: React.MouseEvent) => {
    e.preventDefault()
    setSignUpModalOpen(true)
  }


  const handleStartJourney = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/onboarding")
  }

  return (
    <>
      <div id="cur" />
      <div id="cur-ring" />
      <Graph3D scrollProgress={scrollProgress} />

      <nav>
        <a className="nav-logo" href="/">
          <span className="lb">[</span>growth<span className="los">_os</span><span className="lb">]</span>
        </a>
        <div className="nav-links">
          <a href="#system">The System</a>
          <a href="#how">How It Works</a>
          <a href="#why">Why</a>
          <a href="#pricing">Pricing</a>
          <Link 
            href="/onboarding"
            className="cta" 
            onClick={(e) => {
              e.stopPropagation()
              handleStartJourney(e)
            }}
          >
            Run My Analysis
          </Link>
        </div>
      </nav>

      <div id="pdots">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`pdot ${activePanel === i ? 'on' : ''}`} />
        ))}
      </div>

      <div id="driver" ref={driverRef}>
        <div id="sticky">
          <div className={`panel ${activePanel === 0 ? 'on' : ''}`} id="p0">
            <div className="ptag">Career Progression Engine</div>
            <h1>Stop guessing.<br />Start <span className="g">operating.</span></h1>
            <p>You are talented. You are also flying blind. Growth OS reads your GitHub, resume, and portfolio — then maps the precise gap between where you are and the role you actually want.</p>
            <div className="brow">
              <Link 
                href="/onboarding"
                className="bp" 
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                Run My Analysis
              </Link>
            </div>
          </div>

          <div className={`panel ${activePanel === 1 ? 'on' : ''}`} id="p1">
            <div className="ptag">01 // Gap Analysis</div>
            <h2>Five domains.<br /><span className="g">One honest score.</span></h2>
            <p>System design, execution scope, communication, technical depth, leadership. Growth OS measures each against your target role and shows you the delta — not what sounds impressive, what actually matters.</p>
            <div className="prog-rows">
              <div className="prog-row"><span>System Design</span><div className="prog-bar"><div className="prog-fill" style={{ width: '38%' }} /></div><span className="prog-val">38%</span></div>
              <div className="prog-row"><span>Communication</span><div className="prog-bar"><div className="prog-fill" style={{ width: '15%' }} /></div><span className="prog-val">15%</span></div>
              <div className="prog-row"><span>Leadership</span><div className="prog-bar"><div className="prog-fill" style={{ width: '22%' }} /></div><span className="prog-val">22%</span></div>
              <div className="prog-row"><span>Execution Scope</span><div className="prog-bar"><div className="prog-fill" style={{ width: '48%' }} /></div><span className="prog-val">48%</span></div>
            </div>
            <p style={{ fontSize: ".74rem", color: "var(--muted)" }}>
              {"// Your data in. Your blind spots out."}
            </p>
            <div className="brow" style={{ marginTop: '1.2rem' }}>
              <Link 
                href="/onboarding"
                className="bp" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartJourney(e)
                }}
              >
                See My Gaps
              </Link>
            </div>
          </div>

          <div className={`panel ${activePanel === 2 ? 'on' : ''}`} id="p2">
            <div className="ptag">02 // Daily Engine</div>
            <h2>15 minutes.<br /><span className="g">Compounds daily.</span></h2>
            <p>Targeted micro-lessons. Design-before-code exercises. Meeting logs that build your promotion case while you take notes. Small inputs, compounding outputs.</p>
            <div className="term">
              <div className="tbar"><div className="td td1" /><div className="td td2" /><div className="td td3" /></div>
              <div className="tl"><span className="c">$ </span><span className="o">day_47.log</span></div>
              <div className="tl"><span className="o">Micro-lesson: System design tradeoffs ... </span><span className="c">done</span></div>
              <div className="tl"><span className="o">PR #482 merged, resume updated .......... </span><span className="c">done</span></div>
              <div className="tl"><span className="o">1:1 with Priya logged ................... </span><span className="c">done</span></div>
              <div className="tl"><span className="w">Readiness score: </span><span className="c">65% (+3 today)</span></div>
            </div>
            <div className="brow" style={{ marginTop: '1.2rem' }}>
              <Link 
                href="/onboarding"
                className="bp" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartJourney(e)
                }}
              >
                Start Building
              </Link>
            </div>
          </div>

          <div className={`panel ${activePanel === 3 ? 'on' : ''}`} id="p3">
            <div className="ptag">03 // Brand Engine</div>
            <h2>Your output,<br /><span className="g">finally visible.</span></h2>
            <p>Merged a PR? Resume bullet written. Shipped a feature? LinkedIn draft queued. Had a skip-level? Promotion evidence captured. The system turns your work into signal — automatically.</p>
            <div className="term">
              <div className="tbar"><div className="td td1" /><div className="td td2" /><div className="td td3" /></div>
              <div className="tl"><span className="w">PR #482 merged</span></div>
              <div className="tl"><span className="o">Resume bullet generated ... </span><span className="c">done</span></div>
              <div className="tl"><span className="o">LinkedIn draft ready ...... </span><span className="c">done</span></div>
              <div className="tl"><span className="o">Promo narrative updated ... </span><span className="c">done</span></div>
              <div className="tl"><span className="c">$ </span><span className="tc" /></div>
            </div>
            <div className="brow" style={{ marginTop: '1.2rem' }}>
              <Link 
                href="/onboarding"
                className="bp" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartJourney(e)
                }}
              >
                Build My Signal
              </Link>
            </div>
          </div>

          <div className={`panel ${activePanel === 4 ? 'on' : ''}`} id="p4">
            <div className="ptag">04 // The Jump Signal</div>
            <h2>Know when<br /><span className="g">you are ready.</span></h2>
            <p>Promotion. Pivot. New company. Your own thing. Growth OS tracks readiness across every domain and fires when the data says go — not when you feel like it, when you are actually prepared.</p>
            <div className="term">
              <div className="tbar"><div className="td td1" /><div className="td td2" /><div className="td td3" /></div>
              <div className="tl"><span className="w">Signal check: Alex Chen, Day 90</span></div>
              <div className="tl"><span className="o">Skill readiness ........ </span><span className="c">84%</span></div>
              <div className="tl"><span className="o">Brand signal ........... </span><span className="c">73%</span></div>
              <div className="tl"><span className="o">Evidence portfolio ..... </span><span className="c">91%</span></div>
              <div className="tl" style={{ marginTop: '4px', borderTop: '1px solid #1e1e1e', paddingTop: '6px' }}><span className="c">READY. Time to make your move.</span></div>
            </div>
            <div className="brow" style={{ marginTop: '1.2rem' }}>
              <Link 
                href="/onboarding"
                className="bp" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartJourney(e)
                }}
              >
                Track My Readiness
              </Link>
            </div>
          </div>

          <div className="shint">scroll to explore</div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stats-items">
          <div><div className="stat-n">5</div><div className="stat-l">Domains scored per analysis</div></div>
          <div><div className="stat-n">90d</div><div className="stat-l">Personalized action plan</div></div>
          <div><div className="stat-n">1</div><div className="stat-l">Analysis to know your gaps</div></div>
          <div><div className="stat-n">$0</div><div className="stat-l">To get your full report</div></div>
        </div>
        <div className="stats-note">
          <div className="stats-note-label">
            {"// Built on evidence, not assumptions"}
          </div>
          <p>
            Growth OS ingests your GitHub, resume, and portfolio to generate
            a gap analysis grounded in what you have actually built and shipped.
          </p>
        </div>
      </div>

      <div className="sec" id="system">
        <div className="sec-tag">The System</div>
        <h2 className="sec-h">Six engines.<br /><span className="g">One closed loop.</span></h2>
        <p className="sec-p">Each engine solves one problem. Together they form a flywheel: what you build feeds what you learn, what you learn shapes what you ship, and everything compounds into a promotion-ready narrative.</p>
        <div className="feat-grid">
          <div className="feat"><div className="feat-bar" /><div className="feat-num">01 // analyze</div><div className="feat-title">Gap Analysis Engine</div><p className="feat-desc">Ingests your GitHub, resume, and portfolio. Maps strengths and blind spots against your target role across five domains. No assumptions — only evidence.</p><div className="feat-tag">Free · Live Now</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">02 // learn</div><div className="feat-title">Daily Design Drill</div><p className="feat-desc">Targeted exercises tied to your specific gaps. Design-before-code methodology. The kind of thinking that separates senior from staff.</p><div className="feat-tag">Coming Soon</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">03 // capture</div><div className="feat-title">Living Resume</div><p className="feat-desc">Your resume updates itself. Shipped features, merged PRs, and measurable outcomes become impact-first bullets — written automatically, always current.</p><div className="feat-tag">Coming Soon</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">04 // remember</div><div className="feat-title">Meeting Second Brain</div><p className="feat-desc">Logs every 1:1, standup, and skip-level. Surfaces influence patterns and assembles your promotion narrative from actual conversations.</p><div className="feat-tag">Coming Soon</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">05 // amplify</div><div className="feat-title">LinkedIn on Autopilot</div><p className="feat-desc">Turns milestones into specific, technical posts drafted from what you actually did — not from templates. Visibility without performance.</p><div className="feat-tag">Coming Soon</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">06 // signal</div><div className="feat-title">The Jump Signal</div><p className="feat-desc">Readiness tracked across all domains. When you cross the threshold the system tells you — promotion, pivot, or exit. You will know when.</p><div className="feat-tag">Coming Soon</div></div>
        </div>
      </div>

      <div className="sec alt" id="how">
        <div className="sec-tag">How It Works</div>
        <h2 className="sec-h">
          Day one to
          <br />
          <span className="g">your next move.</span>
        </h2>

        <div className="how-grid">
          {/* LEFT: STEPS */}
          <div className="steps">
            <div
              className={`step how-step ${activeHowStep === 1 ? "active-step" : ""}`}
              onMouseEnter={() => setActiveHowStep(1)}
            >
              <div className="step-n">01</div>
              <div className="step-body">
                <div className="step-label">Connect</div>
                <div className="step-h">Bring your professional footprint</div>
                <p className="step-p">
                  GitHub, resume, portfolio, website. Two minutes. Growth OS starts mapping
                  your career graph and surfacing what you cannot see yourself.
                </p>
              </div>
            </div>

            <div
              className={`step how-step ${activeHowStep === 2 ? "active-step" : ""}`}
              onMouseEnter={() => setActiveHowStep(2)}
            >
              <div className="step-n">02</div>
              <div className="step-body">
                <div className="step-label">Analyze</div>
                <div className="step-h">See where you actually stand</div>
                <p className="step-p">
                  A five-domain breakdown of skills, design maturity, execution, communication,
                  and leadership — measured against your target role. Not opinions. Measurements.
                </p>
              </div>
            </div>

            <div
              className={`step how-step ${activeHowStep === 3 ? "active-step" : ""}`}
              onMouseEnter={() => setActiveHowStep(3)}
            >
              <div className="step-n">03</div>
              <div className="step-body">
                <div className="step-label">Plan</div>
                <div className="step-h">Get a roadmap built from your gaps</div>
                <p className="step-p">
                  Three phases of concrete actions across upskilling, positioning, and visibility.
                  Generated from your specific weaknesses. Not a template — a prescription.
                </p>
              </div>
            </div>

            <div
              className={`step how-step ${activeHowStep === 4 ? "active-step" : ""}`}
              onMouseEnter={() => setActiveHowStep(4)}
            >
              <div className="step-n">04</div>
              <div className="step-body">
                <div className="step-label">Execute</div>
                <div className="step-h">15 minutes a day. The system does the rest.</div>
                <p className="step-p">
                  Daily lessons, design exercises, and meeting logs. Auto-generated resume bullets
                  and LinkedIn drafts. You focus on the work. Growth OS captures the evidence.
                </p>
              </div>
            </div>

            <div
              className={`step how-step ${activeHowStep === 5 ? "active-step" : ""}`}
              onMouseEnter={() => setActiveHowStep(5)}
            >
              <div className="step-n">05</div>
              <div className="step-body">
                <div className="step-label">Move</div>
                <div className="step-h">The system tells you when</div>
                <p className="step-p">
                  When your readiness score crosses the threshold — promotion ask, new role, pivot,
                  or founding — Growth OS fires the signal. No more wondering if it is the right time.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: VISUAL PANEL */}
          <div className="how-visual-wrap">
            {/* STEP 1: Connect */}
            <div className={`how-visual ${activeHowStep === 1 ? "active" : ""}`} id="hv-1">
              <div className="hv-eyebrow">Connecting your data</div>
              <div className="hv-chrome">
                <div className="hv-topbar">
                  <div className="hv-dots">
                    <div className="hv-dot" style={{ background: "#ff5f57" }} />
                    <div className="hv-dot" style={{ background: "#febc2e" }} />
                    <div className="hv-dot" style={{ background: "#10b981" }} />
                  </div>
                  <div className="hv-topbar-title">growth_os // connect</div>
                  <div />
                </div>
                <div className="hv-body">
                  <div className="hv-src-grid">
                    <div className="hv-src s1">
                      <span className="hv-src-ico">⌥</span>
                      <div>
                        <div className="hv-src-name">GitHub</div>
                        <div className="hv-src-detail">9 repos · 2 languages</div>
                      </div>
                      <span className="hv-src-badge">✓ linked</span>
                    </div>
                    <div className="hv-src s2">
                      <span className="hv-src-ico">in</span>
                      <div>
                        <div className="hv-src-name">LinkedIn</div>
                        <div className="hv-src-detail">Profile connected</div>
                      </div>
                      <span className="hv-src-badge">✓ linked</span>
                    </div>
                    <div className="hv-src s3">
                      <span className="hv-src-ico">≡</span>
                      <div>
                        <div className="hv-src-name">Resume</div>
                        <div className="hv-src-detail">3,555 chars extracted</div>
                      </div>
                      <span className="hv-src-badge">✓ linked</span>
                    </div>
                    <div className="hv-src s4">
                      <span className="hv-src-ico">⊕</span>
                      <div>
                        <div className="hv-src-name">Portfolio</div>
                        <div className="hv-src-detail">Site indexed</div>
                      </div>
                      <span className="hv-src-badge">✓ linked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Analyze */}
            <div className={`how-visual ${activeHowStep === 2 ? "active" : ""}`} id="hv-2">
              <div className="hv-eyebrow">Gap analysis results</div>
              <div className="hv-chrome">
                <div className="hv-topbar">
                  <div className="hv-dots">
                    <div className="hv-dot" style={{ background: "#ff5f57" }} />
                    <div className="hv-dot" style={{ background: "#febc2e" }} />
                    <div className="hv-dot" style={{ background: "#10b981" }} />
                  </div>
                  <div className="hv-topbar-title">growth_os // analysis</div>
                  <div />
                </div>
                <div className="hv-body">
                  <div className="hv-gap-list">
                    <div className="hv-gap-item">
                      <div className="hv-gap-top">
                        <span className="hv-gap-name">Technical Depth</span>
                        <span className="hv-gap-val" style={{ color: "var(--em)" }}>
                          80%
                        </span>
                      </div>
                      <div className="hv-gap-track">
                        <div
                          className="hv-gap-bar"
                          style={{ width: "80%", background: "var(--em)" }}
                        />
                      </div>
                    </div>
                    <div className="hv-gap-item">
                      <div className="hv-gap-top">
                        <span className="hv-gap-name">Execution Scope</span>
                        <span className="hv-gap-val" style={{ color: "var(--em)" }}>
                          75%
                        </span>
                      </div>
                      <div className="hv-gap-track">
                        <div
                          className="hv-gap-bar"
                          style={{ width: "75%", background: "var(--em)" }}
                        />
                      </div>
                    </div>
                    <div className="hv-gap-item">
                      <div className="hv-gap-top">
                        <span className="hv-gap-name">System Design</span>
                        <span className="hv-gap-val" style={{ color: "#f59e0b" }}>
                          55%
                        </span>
                      </div>
                      <div className="hv-gap-track">
                        <div
                          className="hv-gap-bar"
                          style={{ width: "55%", background: "#f59e0b" }}
                        />
                      </div>
                    </div>
                    <div className="hv-gap-item">
                      <div className="hv-gap-top">
                        <span className="hv-gap-name">Brand Presence</span>
                        <span className="hv-gap-val" style={{ color: "#ef4444" }}>
                          22%
                        </span>
                      </div>
                      <div className="hv-gap-track">
                        <div
                          className="hv-gap-bar"
                          style={{ width: "22%", background: "#ef4444" }}
                        />
                      </div>
                    </div>
                    <div className="hv-gap-item">
                      <div className="hv-gap-top">
                        <span className="hv-gap-name">Leadership</span>
                        <span className="hv-gap-val" style={{ color: "#ef4444" }}>
                          35%
                        </span>
                      </div>
                      <div className="hv-gap-track">
                        <div
                          className="hv-gap-bar"
                          style={{ width: "35%", background: "#ef4444" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="hv-gap-footer">
                    <span className="hv-gap-footer-label">Overall readiness</span>
                    <span className="hv-overall">
                      60
                      <span
                        style={{
                          fontSize: ".8rem",
                          color: "var(--muted)",
                          fontWeight: 400,
                        }}
                      >
                        /100
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Plan */}
            <div className={`how-visual ${activeHowStep === 3 ? "active" : ""}`} id="hv-3">
              <div className="hv-eyebrow">Your 90-day roadmap</div>
              <div className="hv-chrome">
                <div className="hv-topbar">
                  <div className="hv-dots">
                    <div className="hv-dot" style={{ background: "#ff5f57" }} />
                    <div className="hv-dot" style={{ background: "#febc2e" }} />
                    <div className="hv-dot" style={{ background: "#10b981" }} />
                  </div>
                  <div className="hv-topbar-title">growth_os // roadmap</div>
                  <div />
                </div>
                <div className="hv-body">
                  <div className="hv-phases">
                    <div className="hv-ph lit">
                      <div className="hv-ph-track">
                        <div className="hv-ph-node" />
                        <div className="hv-ph-line" />
                      </div>
                      <div className="hv-ph-content">
                        <div className="hv-ph-label">Phase 1 · Days 1–30</div>
                        <div className="hv-ph-name">Validate &amp; Build Foundation</div>
                        <div className="hv-ph-items">
                          <div className="hv-ph-item">20+ customer interviews</div>
                          <div className="hv-ph-item">Deploy full-stack app on AWS</div>
                          <div className="hv-ph-item">Optimize LinkedIn presence</div>
                        </div>
                      </div>
                    </div>
                    <div className="hv-ph dim">
                      <div className="hv-ph-track">
                        <div className="hv-ph-node" />
                        <div className="hv-ph-line" />
                      </div>
                      <div className="hv-ph-content">
                        <div className="hv-ph-label">Phase 2 · Days 31–60</div>
                        <div className="hv-ph-name">MVP &amp; Team Building</div>
                        <div className="hv-ph-items">
                          <div className="hv-ph-item">Build core MVP features</div>
                          <div className="hv-ph-item">Identify co-founders</div>
                        </div>
                      </div>
                    </div>
                    <div className="hv-ph dim">
                      <div className="hv-ph-track">
                        <div className="hv-ph-node" />
                      </div>
                      <div className="hv-ph-content">
                        <div className="hv-ph-label">Phase 3 · Days 61–90</div>
                        <div className="hv-ph-name">Launch &amp; Traction</div>
                        <div className="hv-ph-items">
                          <div className="hv-ph-item">
                            Public launch · Pitch investors
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: Execute */}
            <div className={`how-visual ${activeHowStep === 4 ? "active" : ""}`} id="hv-4">
              <div className="hv-eyebrow">Today&apos;s activity</div>
              <div className="hv-chrome">
                <div className="hv-topbar">
                  <div className="hv-dots">
                    <div className="hv-dot" style={{ background: "#ff5f57" }} />
                    <div className="hv-dot" style={{ background: "#febc2e" }} />
                    <div className="hv-dot" style={{ background: "#10b981" }} />
                  </div>
                  <div className="hv-topbar-title">growth_os // day 47</div>
                  <div />
                </div>
                <div className="hv-body">
                  <div className="hv-feed">
                    <div className="hv-feed-item hv-fi1">
                      <div className="hv-feed-ico">📚</div>
                      <div className="hv-feed-title">System design micro-lesson</div>
                      <div className="hv-feed-ok">✓ done</div>
                    </div>
                    <div className="hv-feed-item hv-fi2">
                      <div className="hv-feed-ico">⌥</div>
                      <div className="hv-feed-title">
                        PR #482 merged → resume updated
                      </div>
                      <div className="hv-feed-ok">✓ done</div>
                    </div>
                    <div className="hv-feed-item hv-fi3">
                      <div className="hv-feed-ico">🗒</div>
                      <div className="hv-feed-title">
                        1:1 with Priya → promo case logged
                      </div>
                      <div className="hv-feed-ok">✓ done</div>
                    </div>
                    <div className="hv-feed-item hv-fi4">
                      <div className="hv-feed-ico">in</div>
                      <div className="hv-feed-title">
                        LinkedIn draft ready for review
                      </div>
                      <div className="hv-feed-ok">✓ done</div>
                    </div>
                  </div>
                  <div className="hv-streak-bar" style={{ marginTop: ".6rem" }}>
                    <span className="hv-streak-left">Current streak</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: ".3rem",
                      }}
                    >
                      <span className="hv-streak-num">47</span>
                      <span style={{ fontSize: ".65rem", color: "var(--muted)" }}>
                        days
                      </span>
                    </div>
                    <span style={{ fontSize: ".68rem", color: "var(--em)" }}>
                      Readiness +3 today
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 5: Move */}
            <div className={`how-visual ${activeHowStep === 5 ? "active" : ""}`} id="hv-5">
              <div className="hv-eyebrow">Your jump signal</div>
              <div className="hv-chrome">
                <div className="hv-topbar">
                  <div className="hv-dots">
                    <div className="hv-dot" style={{ background: "#ff5f57" }} />
                    <div className="hv-dot" style={{ background: "#febc2e" }} />
                    <div className="hv-dot" style={{ background: "#10b981" }} />
                  </div>
                  <div className="hv-topbar-title">growth_os // signal · day 90</div>
                  <div />
                </div>
                <div className="hv-body">
                  <div className="hv-ready-top">
                    <div className="hv-ring-wrap">
                      <svg viewBox="0 0 90 90" width="90" height="90">
                        <circle
                          cx="45"
                          cy="45"
                          r="38"
                          fill="none"
                          stroke="var(--border)"
                          strokeWidth="5"
                        />
                        <circle
                          cx="45"
                          cy="45"
                          r="38"
                          fill="none"
                          stroke="var(--em)"
                          strokeWidth="5"
                          strokeDasharray="239"
                          strokeDashoffset="36"
                          strokeLinecap="round"
                          transform="rotate(-90 45 45)"
                          style={{ animation: "ringDraw 1.2s ease-out forwards" }}
                        />
                      </svg>
                      <div className="hv-ring-pct">85%</div>
                    </div>
                    <div className="hv-ready-scores">
                      <div className="hv-rs-row">
                        <span>Skill readiness</span>
                        <span className="hv-rs-val">84%</span>
                      </div>
                      <div className="hv-rs-row">
                        <span>Brand signal</span>
                        <span className="hv-rs-val">73%</span>
                      </div>
                      <div className="hv-rs-row">
                        <span>Evidence portfolio</span>
                        <span className="hv-rs-val">91%</span>
                      </div>
                    </div>
                  </div>
                  <div className="hv-ready-signal">
                    READY<span className="hv-blink">_</span>&nbsp;Make your move.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sec" id="why">
        <div className="sec-tag">Why Growth OS</div>
        <div className="why-grid">
          <div>
            <div className="why-quote">Most engineers manage their career the way they manage their inbox.<br /><br /><span className="g">Reactively. One notification at a time. Hoping the right person notices the right thing at the right moment.</span><br /><br />Your career deserves the same architecture as your systems.</div>
          </div>
          <ul className="belief-list">
            <li>Your commits should write your resume while you sleep</li>
            <li>Your 1:1 notes should feed your promotion case without extra effort</li>
            <li>Your learning should close specific gaps, not chase trending topics</li>
            <li>Your LinkedIn should show evidence, not performance</li>
            <li>You should know your next move before anyone asks</li>
            <li>Your career should be engineered, not improvised</li>
          </ul>
        </div>
      </div>

      <div className="sec alt" id="pricing">
        <div className="sec-tag">Pricing</div>
        <h2 className="sec-h">Start free.<br /><span className="g">No card required.</span></h2>
        <p className="sec-p">Run a full gap analysis today at zero cost. Upgrade when the daily engine launches.</p>
        <div className="pricing-grid">
          <div className="plan">
            <span className="plan-badge">
              {"// free forever"}
            </span>
            <div className="plan-name">Explorer</div>
            <div className="plan-price">$0<span> / forever</span></div>
            <div className="plan-desc">Full gap analysis. Personalized plan. No sign-up required.</div>
            <ul className="plan-features">
              <li>Gap analysis across 5 domains</li>
              <li>Readiness score + domain breakdowns</li>
              <li>Personalized 90-day action plan</li>
              <li>Upskilling project recommendations</li>
              <li>Posting strategy + promotion narrative</li>
              <li>Downloadable results report</li>
            </ul>
            <a href="/onboarding" className="plan-cta outline" onClick={handleStartJourney}>Start Free</a>
          </div>
          <div className="plan featured">
            <span className="plan-badge">
              {"// coming soon"}
            </span>
            <div className="plan-name">Operator</div>
            <div className="plan-price">$29<span> / month</span></div>
            <div className="plan-desc">The full operating system. Daily actions, living resume, and your jump signal.</div>
            <ul className="plan-features">
              <li>Everything in Explorer</li>
              <li>Unlimited gap analysis re-runs</li>
              <li>Daily Design Drill (micro-learning + code)</li>
              <li>Living Resume (auto-updates from work)</li>
              <li>Impact Bank (real outcome capture)</li>
              <li>Meeting Second Brain + Calendar Sync</li>
              <li>LinkedIn Post Generator (weekly drafts)</li>
              <li>Jump Signal readiness tracker</li>
            </ul>
            <a href="#access" className="plan-cta solid" onClick={handleGetAccess}>Join Waitlist</a>
          </div>
          <div className="plan">
            <span className="plan-badge">
              {"// enterprise"}
            </span>
            <div className="plan-name">Enterprise</div>
            <div className="plan-price" style={{ fontSize: '1.6rem' }}>Custom</div>
            <div className="plan-desc">For engineering orgs that want structured progression at scale. Tailored onboarding, team dashboards, and dedicated support.</div>
            <div style={{ flex: 1 }} />
            <a href="mailto:hello@growthos.dev" className="plan-cta outline">Let&apos;s Talk</a>
          </div>
        </div>
      </div>

      <div className="sec" id="access">
        <div className="sec-tag">Get Started</div>
        <div className="cta-inner">
          <h2>See your gaps.<br /><span className="g">Close them.</span></h2>
          <p>One analysis. Five domains. A plan built from your actual work. Free — no sign-up, no card, no catch.</p>
          <div className="brow" style={{ marginTop: '1.8rem' }}>
            <a href="/onboarding" className="bp" onClick={handleStartJourney}>Run My Analysis</a>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <span className="f-logo">growth<span className="g">_os</span></span>
            <p>The structured progression engine for people who build things.</p>
          </div>
          <div className="footer-col"><h4>Product</h4><a href="#system">The System</a><a href="#how">How It Works</a><a href="#pricing">Pricing</a><a href="#access">Get Access</a></div>
          <div className="footer-col"><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a><a href="#">Contact</a></div>
          <div className="footer-col"><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Security</a></div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">
            {"// growth_os · v1.0 · "} 
            {new Date().getFullYear()}
            {" · all rights reserved"}
          </div>
          <div className="footer-socials"><a href="#">Twitter</a><a href="#">GitHub</a><a href="#">LinkedIn</a></div>
        </div>
      </footer>

      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        callbackUrl="/onboarding"
      />
    </>
  )
}
