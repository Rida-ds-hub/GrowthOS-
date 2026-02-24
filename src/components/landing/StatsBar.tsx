"use client"

export function StatsBar() {
  const stats = [
    { number: "3", label: "Domains tracked daily" },
    { number: "15m", label: "Daily commitment" },
    { number: "90d", label: "Average to next jump" },
    { number: "0", label: "Guesswork required" },
  ]

  return (
    <div className="relative z-10 border-t border-zinc-800 border-b border-zinc-800 bg-zinc-900 py-10 px-12 flex gap-20 flex-wrap">
      {stats.map((stat, index) => (
        <div key={index}>
          <div className="font-['var(--font-jetbrains-mono)'] text-4xl font-bold text-emerald-500 leading-none mb-1">
            {stat.number}
          </div>
          <div className="text-[0.62rem] tracking-[0.2em] text-zinc-500 uppercase mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
