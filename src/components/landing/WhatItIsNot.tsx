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
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
          What This Is Not
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <Card key={index} className="p-6 bg-zinc-900/50 border-zinc-800">
              <div className="text-zinc-500 line-through mb-2">{item.not}</div>
              <div className="text-emerald-400 font-medium">{item.is}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
