"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="relative py-32 px-4 bg-[#0a0a0a] border-b border-zinc-800 overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to close the gap?
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Get your personalized gap analysis and 3-phase action plan. No sign-up required.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button 
              asChild 
              size="lg" 
              className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold px-8 py-6 text-lg"
            >
              <Link href="/onboarding">Run your gap analysis free →</Link>
            </Button>
            <p className="text-sm text-white">No credit card required</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
