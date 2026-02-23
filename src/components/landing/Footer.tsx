"use client"

import Link from "next/link"
import { Logo } from "@/components/logo/Logo"
import { Github, Linkedin, Twitter } from "lucide-react"

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Community", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Logo variant="horizontal" size="header" />
            <p className="mt-4 text-sm text-zinc-400">
              Build the evidence. Earn the promotion.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Growth OS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
