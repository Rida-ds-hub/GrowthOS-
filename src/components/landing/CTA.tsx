"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function CTA() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push("/onboarding")
  }

  return (
    <section className="relative z-10 bg-[#0a0a0a] border-t border-zinc-800 py-28 px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-4 h-px bg-emerald-500" />
          <span className="text-[0.62rem] tracking-[0.4em] uppercase text-emerald-500">
            Get Access
          </span>
        </div>
        <div className="border border-zinc-800 p-16 max-w-[580px] relative bg-zinc-900">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
          <h2 className="font-['var(--font-jetbrains-mono)'] text-2xl md:text-3xl font-bold text-white leading-tight mb-3 tracking-tight">
            Start your
            <br />
            <span className="text-emerald-500">gap analysis today.</span>
          </h2>
          <p className="text-sm leading-relaxed text-zinc-500 mb-7">
            Join engineers, PMs, and designers who are done drifting. Early
            access is open now. No credit card. No fluff.
          </p>
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 bg-[#0a0a0a] border border-zinc-800 border-r-0 px-4 py-3 font-mono text-xs text-white outline-none focus:border-emerald-500/30"
            />
            <Button
              type="submit"
              className="bg-emerald-500 text-[#0a0a0a] border-none px-6 py-3 font-['var(--font-ibm-plex-mono)'] text-xs tracking-wider uppercase font-bold hover:opacity-82 whitespace-nowrap"
            >
              Request Access
            </Button>
          </form>
          <p className="text-[0.68rem] text-zinc-500 mt-3">
            // Early access. No credit card. No spam. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
