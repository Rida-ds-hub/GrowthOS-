"use client"

import { motion } from "framer-motion"

const steps = [
  "Set your target role and timeline",
  "Connect GitHub, upload your resume, link LinkedIn",
  "Receive a structured gap analysis across 5 domains",
  "Train decision-making daily. Design before code.",
  "Build your promotion case automatically",
]

export function HowItWorks() {
  return (
    <section className="relative py-32 px-4 bg-[#0a0a0a] border-b border-zinc-800 overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Get your personalized gap analysis in minutes. No sign-up required.
          </p>
        </motion.div>
        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold">
                {index + 1}
              </div>
              <p className="text-lg text-zinc-300 pt-2 leading-relaxed">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
