"use client"

const beliefs = [
  "Your commits should build your resume in real time",
  "Your 1:1 notes should feed your promotion case automatically",
  "Your learning should be tied to actual gaps, not trending courses",
  "Your LinkedIn should reflect real work, not performed thought leadership",
  "You should always know what your next move is and whether you are ready",
  "Your career should be a system, not a series of accidents",
  "The best engineers ship great code and manage their trajectory deliberately",
]

export function WhatItIsNot() {
  return (
    <section
      id="why"
      className="relative z-10 bg-[#0a0a0a] border-t border-[#1e1e1e] py-28 px-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-4 h-px bg-emerald-500" />
          <span className="text-[0.62rem] tracking-[0.4em] uppercase text-emerald-500">
            Why Growth OS
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mt-10">
          <div>
            <div className="font-['var(--font-jetbrains-mono)'] text-[clamp(1.1rem,2vw,1.6rem)] font-bold text-white leading-[1.4] tracking-[-0.02em]">
              Most engineers manage their career the way they manage email.
              <br />
              <br />
              <span className="text-emerald-500">
                Reactively. Hoping someone notices. Guessing when to move.
              </span>
              <br />
              <br />
              Your career deserves the same rigor as your codebase.
            </div>
          </div>
          <ul className="list-none">
            {beliefs.map((belief, index) => (
              <li
                key={index}
                className="text-sm leading-none text-[#a1a1aa] font-light flex items-center gap-3 border-b border-[#1e1e1e] py-[0.85rem]"
              >
                <div className="w-[3px] h-[3px] bg-emerald-500 rounded-full flex-shrink-0" />
                <span>{belief}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
