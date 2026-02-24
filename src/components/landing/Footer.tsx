"use client"

import Link from "next/link"

const footerLinks = {
  Product: [
    { label: "The System", href: "#system" },
    { label: "How It Works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "Get Access", href: "#access" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-800 bg-[#0a0a0a]">
      <div className="px-12 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <span className="font-['var(--font-jetbrains-mono)'] font-bold text-base text-white mb-3 block">
            growth<span className="text-emerald-500">_os</span>
          </span>
          <p className="text-xs leading-relaxed text-zinc-500 max-w-[200px]">
            The career progression engine for engineers, PMs, and designers who
            refuse to drift.
          </p>
        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <h4 className="text-[0.65rem] tracking-[0.3em] uppercase text-emerald-500 mb-4">
              {category}
            </h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-500 hover:text-white transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-800 px-12 py-6 flex justify-between items-center">
        <div className="text-[0.68rem] text-zinc-800 tracking-[0.12em]">
          // growth_os · v1.0 · 2025 · all rights reserved
        </div>
        <div className="flex gap-6">
          <a
            href="#"
            className="text-[0.68rem] text-zinc-500 hover:text-emerald-500 transition-colors tracking-wider"
          >
            Twitter
          </a>
          <a
            href="#"
            className="text-[0.68rem] text-zinc-500 hover:text-emerald-500 transition-colors tracking-wider"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-[0.68rem] text-zinc-500 hover:text-emerald-500 transition-colors tracking-wider"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
