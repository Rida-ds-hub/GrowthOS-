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
    <section className="py-24 px-4 bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
          How It Works
        </h2>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.1 }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-semibold text-sm">
                {index + 1}
              </div>
              <p className="text-lg text-zinc-300 pt-1">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
