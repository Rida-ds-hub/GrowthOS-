"use client"

import { useEffect, useState } from "react"
import { useScroll } from "framer-motion"

export function ProgressDots() {
  const { scrollYProgress } = useScroll()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // 5 panels, so divide scroll progress into 5 segments
      const index = Math.min(Math.floor(latest * 5), 4)
      setActiveIndex(index)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 h-1 rounded-full transition-all duration-[350ms] ${
            activeIndex === i
              ? "bg-emerald-500 border-emerald-500 scale-[1.7]"
              : "bg-[#27272a] border border-zinc-600"
          }`}
        />
      ))}
    </div>
  )
}
