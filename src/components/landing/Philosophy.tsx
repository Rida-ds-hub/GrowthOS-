"use client"

import { motion } from "framer-motion"

const features = [
  {
    num: "01 // connect",
    title: "Gap Analysis Engine",
    description: "Ingests GitHub, LinkedIn, resume, and portfolio. Runs a full gap analysis against your target role. Surfaces what actually matters, not what sounds impressive.",
    tag: "Connect, Analyze, Act",
  },
  {
    num: "02 // learn",
    title: "Micro-Learning + Code",
    description: "15 minutes of targeted learning per day. In-app code commits tied to real projects. Streak tracking. System thinking exercises. Learning that compounds into genuine expertise.",
    tag: "15 min / day",
  },
  {
    num: "03 // resume",
    title: "Living Resume",
    description: "Every PR merged, every feature shipped, every win captured. Automatically written as impact-first bullets. Your resume is always current and always promotion-ready.",
    tag: "Always Current",
  },
  {
    num: "04 // memory",
    title: "Meeting Second Brain",
    description: "Calendar-integrated. Logs and analyzes every 1:1, skip-level, standup, and retro. Surfaces patterns in your influence and builds your promotion narrative from actual evidence.",
    tag: "Calendar Integrated",
  },
  {
    num: "05 // brand",
    title: "LinkedIn on Autopilot",
    description: "Real progress becomes real posts. Drafted from your actual commits, milestones, and learning. Specific, technical, never generic. Presence without the performance anxiety.",
    tag: "Presence Without Performance",
  },
  {
    num: "06 // signal",
    title: "The Jump Signal",
    description: "Promotion, pivot, new role, or founding something. Readiness signals tracked across all six domains. You always know exactly where you stand and what to do next.",
    tag: "Promote, Pivot, Found",
  },
]

export function Philosophy() {
  return (
    <section
      id="system"
      className="relative z-10 bg-[#0a0a0a] border-t border-zinc-800 py-28 px-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-4 h-px bg-emerald-500" />
          <span className="text-[0.62rem] tracking-[0.4em] uppercase text-emerald-500">
            The System
          </span>
        </div>
        <h2 className="font-['var(--font-jetbrains-mono)'] text-3xl md:text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
          Six engines.
          <br />
          <span className="text-emerald-500">One OS.</span>
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400 font-light max-w-[520px] mb-12">
          Each piece is useful alone. Together they create a flywheel. Every
          commit updates the resume. Every meeting feeds the promotion case.
          Every day of progress generates your brand. Nothing is wasted.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-[#0a0a0a] p-8 relative overflow-hidden group hover:bg-zinc-900 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              <div className="text-[0.6rem] tracking-[0.35em] text-zinc-500 uppercase mb-2.5">
                {feature.num}
              </div>
              <h3 className="font-['var(--font-jetbrains-mono)'] text-sm font-bold text-white mb-2.5">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500 font-light mb-4">
                {feature.description}
              </p>
              <div className="text-[0.6rem] tracking-[0.25em] uppercase text-emerald-500 border-l-2 border-emerald-500 pl-2 inline-block">
                {feature.tag}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
