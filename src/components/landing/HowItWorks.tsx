"use client"

import { motion } from "framer-motion"

const steps = [
  {
    label: "Connect",
    title: "Link your professional surface area",
    description:
      "GitHub, LinkedIn, resume, portfolio. Takes minutes. Growth OS immediately begins building your career graph and identifying the gaps you have been guessing at.",
  },
  {
    label: "Analyze",
    title: "Get your gap analysis",
    description:
      "A precise breakdown of skill gaps, brand gaps, and trajectory gaps mapped against your actual target. Not what a coach assumes you want. What the data shows you need.",
  },
  {
    label: "Plan",
    title: "Receive your 90-day roadmap",
    description:
      "A 30-60-90 day plan across upskilling, branding, and positioning. Built from your specific gaps. Adapts as you make progress. Never stale, never generic.",
  },
  {
    label: "Execute",
    title: "15 minutes a day. Watch it compound.",
    description:
      "Daily micro-learning, code tasks, and reflections. The system logs your meetings, updates your resume, drafts your LinkedIn posts. You just do the work. Growth OS handles the rest.",
  },
  {
    label: "Move",
    title: "Make your jump when the signal fires",
    description:
      "When your readiness score hits the threshold, Growth OS tells you. Promotion ask, job search, pivot, or starting something of your own. You will know. And you will be ready.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative z-10 bg-zinc-900 border-t border-zinc-800 py-28 px-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-4 h-px bg-emerald-500" />
          <span className="text-[0.62rem] tracking-[0.4em] uppercase text-emerald-500">
            How It Works
          </span>
        </div>
        <h2 className="font-['var(--font-jetbrains-mono)'] text-3xl md:text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
          Day one to
          <br />
          <span className="text-emerald-500">your next jump.</span>
        </h2>

        <div className="flex flex-col gap-0 mt-12 max-w-[680px]">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-[48px_1fr] gap-6 pb-10 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {index < steps.length - 1 && (
                <div className="absolute left-[23px] top-12 bottom-0 w-px bg-zinc-800" />
              )}
              <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center text-xs tracking-wider text-zinc-500 bg-[#0a0a0a] group-hover:border-emerald-500 group-hover:text-emerald-500 group-hover:shadow-[0_0_16px_rgba(16,185,129,0.12)] transition-all flex-shrink-0">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="pt-1.5">
                <div className="text-[0.62rem] tracking-[0.35em] uppercase text-emerald-500 mb-1.5">
                  {step.label}
                </div>
                <h3 className="font-['var(--font-jetbrains-mono)'] text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 font-light">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
