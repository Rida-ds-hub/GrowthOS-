"use client"

import { Card } from "@/components/ui/card"

const items = [
  { not: "Course Platform", is: "We train thinking, not deliver content" },
  { not: "Resume Builder", is: "Resumes are an output, not the product" },
  { not: "Job Board", is: "Out of scope entirely" },
  { not: "Motivational App", is: "No streaks, no confetti, no guru tone" },
  { not: "Mentorship Marketplace", is: "Mentors coming soon, but not the core" },
]

export function WhatItIsNot() {
  return (
    <section className="py-32 px-4 bg-[#0a0a0a] border-b border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
          What this is not
        </h2>
        <p className="text-xl text-zinc-400 mb-12 text-center max-w-2xl mx-auto">
          Clarity on what Growth OS is and isn't.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card key={index} className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="text-zinc-500 line-through mb-3 text-sm">{item.not}</div>
              <div className="text-zinc-300 font-medium">{item.is}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
