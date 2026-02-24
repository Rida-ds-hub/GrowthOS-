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
            <h1>Stop drifting.<br />Start <span className="g">operating.</span></h1>
            <p>Most engineers are talented and stuck. Growth OS connects your GitHub, LinkedIn, resume, and calendar into one living system that tells you exactly what to do next and when you are ready to move.</p>
            <div className="brow">
              <Link 
                href="/onboarding"
                className="bp" 
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                Start My Journey
              </Link>
            </div>
          </div>

          <div className={`panel ${activePanel === 1 ? 'on' : ''}`} id="p1">
            <div className="ptag">01 // Gap Analysis</div>
            <h2>We find the<br /><span className="g">exact gap.</span></h2>
            <p>Connect your GitHub, LinkedIn, resume, and portfolio. Growth OS reads your actual trajectory and surfaces the precise delta between where you are and the role, level, or path you are targeting.</p>
            <div className="prog-rows">
              <div className="prog-row"><span>System Design</span><div className="prog-bar"><div className="prog-fill" style={{ width: '38%' }} /></div><span className="prog-val">38%</span></div>
              <div className="prog-row"><span>Brand Presence</span><div className="prog-bar"><div className="prog-fill" style={{ width: '15%' }} /></div><span className="prog-val">15%</span></div>
              <div className="prog-row"><span>Leadership Signal</span><div className="prog-bar"><div className="prog-fill" style={{ width: '22%' }} /></div><span className="prog-val">22%</span></div>
              <div className="prog-row"><span>Stakeholder Comms</span><div className="prog-bar"><div className="prog-fill" style={{ width: '48%' }} /></div><span className="prog-val">48%</span></div>
            </div>
            <p style={{ fontSize: '.74rem', color: 'var(--muted)' }}>// Real gaps. Real data. Zero guesswork.</p>
          </div>

          <div className={`panel ${activePanel === 2 ? 'on' : ''}`} id="p2">
            <div className="ptag">02 // Daily Engine</div>
            <h2>15 minutes.<br /><span className="g">Compounds daily.</span></h2>
            <p>Micro-learning tied to your actual gaps. In-app code commits. System thinking exercises. Calendar-integrated meeting logs. Every action feeds the machine and moves your readiness score forward.</p>
            <div className="term">
              <div className="tbar"><div className="td td1" /><div className="td td2" /><div className="td td3" /></div>
              <div className="tl"><span className="c">$ </span><span className="o">day_47.log</span></div>
              <div className="tl"><span className="o">Micro-lesson: System design tradeoffs ... </span><span className="c">done</span></div>
              <div className="tl"><span className="o">PR #482 merged, resume updated .......... </span><span className="c">done</span></div>
              <div className="tl"><span className="o">1:1 with Priya logged ................... </span><span className="c">done</span></div>
              <div className="tl"><span className="w">Readiness score: </span><span className="c">65% (+3 today)</span></div>
            </div>
          </div>

          <div className={`panel ${activePanel === 3 ? 'on' : ''}`} id="p3">
            <div className="ptag">03 // Brand Engine</div>
            <h2>Your work,<br /><span className="g">seen by the right people.</span></h2>
            <p>Every merged PR becomes a resume bullet. Every 1:1 becomes evidence for your promotion case. Every week of progress becomes a LinkedIn post. Real work. Real signal. No cringe.</p>
            <div className="term">
              <div className="tbar"><div className="td td1" /><div className="td td2" /><div className="td td3" /></div>
              <div className="tl"><span className="w">PR #482 merged</span></div>
              <div className="tl"><span className="o">Resume bullet generated ... </span><span className="c">done</span></div>
              <div className="tl"><span className="o">LinkedIn draft ready ...... </span><span className="c">done</span></div>
              <div className="tl"><span className="o">Promo narrative updated ... </span><span className="c">done</span></div>
              <div className="tl"><span className="c">$ </span><span className="tc" /></div>
            </div>
          </div>

          <div className={`panel ${activePanel === 4 ? 'on' : ''}`} id="p4">
            <div className="ptag">04 // The Jump Signal</div>
            <h2>You will know<br /><span className="g">exactly when to move.</span></h2>
            <p>Promotion. Pivot. New role. Founding something. Growth OS tracks your readiness signal across all domains. When the data says you are ready, it tells you. No more guessing. No more waiting too long.</p>
            <div className="term">
              <div className="tbar"><div className="td td1" /><div className="td td2" /><div className="td td3" /></div>
              <div className="tl"><span className="w">Signal check: Alex Chen, Day 90</span></div>
              <div className="tl"><span className="o">Skill readiness ........ </span><span className="c">84%</span></div>
              <div className="tl"><span className="o">Brand signal ........... </span><span className="c">73%</span></div>
              <div className="tl"><span className="o">Evidence portfolio ..... </span><span className="c">91%</span></div>
              <div className="tl" style={{ marginTop: '4px', borderTop: '1px solid #1e1e1e', paddingTop: '6px' }}><span className="c">READY. Time to make your move.</span></div>
            </div>
            <div className="brow" style={{ marginTop: '1.2rem' }}>
              <a href="/onboarding" className="bp" onClick={handleStartJourney}>Start My Journey</a>
            </div>
          </div>

          <div className="shint">scroll to explore</div>
        </div>
      </div>

      <div className="stats-bar">
        <div><div className="stat-n">3</div><div className="stat-l">Domains tracked daily</div></div>
        <div><div className="stat-n">15m</div><div className="stat-l">Daily commitment</div></div>
        <div><div className="stat-n">90d</div><div className="stat-l">Average to next jump</div></div>
        <div><div className="stat-n">0</div><div className="stat-l">Guesswork required</div></div>
      </div>

      <div className="sec" id="system">
        <div className="sec-tag">The System</div>
        <h2 className="sec-h">Six engines.<br /><span className="g">One OS.</span></h2>
        <p className="sec-p">Each piece is useful alone. Together they create a flywheel. Every commit updates the resume. Every meeting feeds the promotion case. Every day of progress generates your brand. Nothing is wasted.</p>
        <div className="feat-grid">
          <div className="feat"><div className="feat-bar" /><div className="feat-num">01 // connect</div><div className="feat-title">Gap Analysis Engine</div><p className="feat-desc">Ingests GitHub, LinkedIn, resume, and portfolio. Runs a full gap analysis against your target role. Surfaces what actually matters, not what sounds impressive.</p><div className="feat-tag">Connect, Analyze, Act</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">02 // learn</div><div className="feat-title">Micro-Learning + Code</div><p className="feat-desc">15 minutes of targeted learning per day. In-app code commits tied to real projects. Streak tracking. System thinking exercises. Learning that compounds into genuine expertise.</p><div className="feat-tag">15 min / day</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">03 // resume</div><div className="feat-title">Living Resume</div><p className="feat-desc">Every PR merged, every feature shipped, every win captured. Automatically written as impact-first bullets. Your resume is always current and always promotion-ready.</p><div className="feat-tag">Always Current</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">04 // memory</div><div className="feat-title">Meeting Second Brain</div><p className="feat-desc">Calendar-integrated. Logs and analyzes every 1:1, skip-level, standup, and retro. Surfaces patterns in your influence and builds your promotion narrative from actual evidence.</p><div className="feat-tag">Calendar Integrated</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">05 // brand</div><div className="feat-title">LinkedIn on Autopilot</div><p className="feat-desc">Real progress becomes real posts. Drafted from your actual commits, milestones, and learning. Specific, technical, never generic. Presence without the performance anxiety.</p><div className="feat-tag">Presence Without Performance</div></div>
          <div className="feat"><div className="feat-bar" /><div className="feat-num">06 // signal</div><div className="feat-title">The Jump Signal</div><p className="feat-desc">Promotion, pivot, new role, or founding something. Readiness signals tracked across all six domains. You always know exactly where you stand and what to do next.</p><div className="feat-tag">Promote, Pivot, Found</div></div>
        </div>
      </div>

      <div className="sec alt" id="how">
        <div className="sec-tag">How It Works</div>
        <h2 className="sec-h">Day one to<br /><span className="g">your next jump.</span></h2>
        <div className="steps">
          <div className="step"><div className="step-n">01</div><div className="step-body"><div className="step-label">Connect</div><div className="step-h">Link your professional surface area</div><p className="step-p">GitHub, LinkedIn, resume, portfolio. Takes minutes. Growth OS immediately begins building your career graph and identifying the gaps you have been guessing at.</p></div></div>
          <div className="step"><div className="step-n">02</div><div className="step-body"><div className="step-label">Analyze</div><div className="step-h">Get your gap analysis</div><p className="step-p">A precise breakdown of skill gaps, brand gaps, and trajectory gaps mapped against your actual target. Not what a coach assumes you want. What the data shows you need.</p></div></div>
          <div className="step"><div className="step-n">03</div><div className="step-body"><div className="step-label">Plan</div><div className="step-h">Receive your 90-day roadmap</div><p className="step-p">A 30-60-90 day plan across upskilling, branding, and positioning. Built from your specific gaps. Adapts as you make progress. Never stale, never generic.</p></div></div>
          <div className="step"><div className="step-n">04</div><div className="step-body"><div className="step-label">Execute</div><div className="step-h">15 minutes a day. Watch it compound.</div><p className="step-p">Daily micro-learning, code tasks, and reflections. The system logs your meetings, updates your resume, drafts your LinkedIn posts. You just do the work. Growth OS handles the rest.</p></div></div>
          <div className="step"><div className="step-n">05</div><div className="step-body"><div className="step-label">Move</div><div className="step-h">Make your jump when the signal fires</div><p className="step-p">When your readiness score hits the threshold, Growth OS tells you. Promotion ask, job search, pivot, or starting something of your own. You will know. And you will be ready.</p></div></div>
        </div>
      </div>

      <div className="sec" id="why">
        <div className="sec-tag">Why Growth OS</div>
        <div className="why-grid">
          <div>
            <div className="why-quote">Most engineers manage their career the way they manage email.<br /><br /><span className="g">Reactively. Hoping someone notices. Guessing when to move.</span><br /><br />Your career deserves the same rigor as your codebase.</div>
          </div>
          <ul className="belief-list">
            <li>Your commits should build your resume in real time</li>
            <li>Your 1:1 notes should feed your promotion case automatically</li>
            <li>Your learning should be tied to actual gaps, not trending courses</li>
            <li>Your LinkedIn should reflect real work, not performed thought leadership</li>
            <li>You should always know what your next move is and whether you are ready</li>
            <li>Your career should be a system, not a series of accidents</li>
            <li>The best engineers ship great code and manage their trajectory deliberately</li>
          </ul>
        </div>
      </div>

      <div className="sec alt" id="pricing">
        <div className="sec-tag">Pricing</div>
        <h2 className="sec-h">Simple pricing.<br /><span className="g">No surprises.</span></h2>
        <p className="sec-p">Start free. Upgrade when you see the value. All plans include the core gap analysis and roadmap generator.</p>
        <div className="pricing-grid">
          <div className="plan">
            <span className="plan-badge">// free tier</span>
            <div className="plan-name">Explorer</div>
            <div className="plan-price">$0<span> / month</span></div>
            <div className="plan-desc">Connect, analyze your gaps, and see your roadmap. No card required.</div>
            <ul className="plan-features">
              <li>Gap analysis (1 target role)</li><li>90-day roadmap generated</li>
              <li>5 micro-learning sessions / month</li><li>Resume snapshot</li><li>Community access</li>
            </ul>
            <a href="#access" className="plan-cta outline" onClick={handleStartJourney}>Start Free</a>
          </div>
          <div className="plan featured">
            <span className="plan-badge">// most popular</span>
            <div className="plan-name">Operator</div>
            <div className="plan-price">$29<span> / month</span></div>
            <div className="plan-desc">The full OS. For engineers serious about their next jump.</div>
            <ul className="plan-features">
              <li>Unlimited gap analyses</li><li>Live adaptive roadmap</li>
              <li>Daily micro-learning + code tasks</li><li>Living resume (auto-updates)</li>
              <li>Meeting second brain + calendar sync</li><li>LinkedIn post drafts (weekly)</li>
              <li>Jump Signal readiness tracker</li>
            </ul>
            <a href="#access" className="plan-cta solid" onClick={handleGetAccess}>Get Early Access</a>
          </div>
          <div className="plan">
            <span className="plan-badge">// for teams</span>
            <div className="plan-name">Team OS</div>
            <div className="plan-price">$79<span> / seat / mo</span></div>
            <div className="plan-desc">For engineering managers who want their whole team moving deliberately.</div>
            <ul className="plan-features">
              <li>Everything in Operator</li><li>Team-level gap dashboard</li>
              <li>Manager view and coaching prompts</li><li>Aggregate readiness signals</li>
              <li>Custom target role templates</li><li>Slack integration</li><li>Priority support</li>
            </ul>
            <a href="#access" className="plan-cta outline" onClick={handleGetAccess}>Contact Us</a>
          </div>
        </div>
      </div>

      <div className="sec" id="access">
        <div className="sec-tag">Get Access</div>
        <div className="cta-inner">
          <h2>Start your<br /><span className="g">gap analysis today.</span></h2>
          <p>Join engineers, PMs, and designers who are done drifting. Early access is open now. No credit card. No fluff.</p>
          <div className="brow" style={{ marginTop: '1.8rem' }}>
            <a href="/onboarding" className="bp" onClick={handleStartJourney}>Start My Journey</a>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <span className="f-logo">growth<span className="g">_os</span></span>
            <p>The career progression engine for engineers, PMs, and designers who refuse to drift.</p>
          </div>
          <div className="footer-col"><h4>Product</h4><a href="#system">The System</a><a href="#how">How It Works</a><a href="#pricing">Pricing</a><a href="#access">Get Access</a></div>
          <div className="footer-col"><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a><a href="#">Contact</a></div>
          <div className="footer-col"><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Security</a></div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">// growth_os · v1.0 · {new Date().getFullYear()} · all rights reserved</div>
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
