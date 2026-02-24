"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { SignInModal } from "@/components/auth/SignInModal"
import { SignUpModal } from "@/components/auth/SignUpModal"

const navItems = [
  { label: "The System", href: "#system" },
  { label: "How It Works", href: "#how" },
  { label: "Why", href: "#why" },
  { label: "Pricing", href: "#pricing" },
]

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signInModalOpen, setSignInModalOpen] = useState(false)
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleStartJourney = () => {
    // Allow users to start journey without signing in
    router.push("/onboarding")
  }

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault()
    setSignInModalOpen(true)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] bg-[rgba(10,10,10,0.95)] backdrop-blur-[20px] border-b border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-1.5 font-['var(--font-jetbrains-mono)'] text-[15px] font-bold text-white">
            <span className="text-emerald-500 opacity-45 font-light text-[17px]">[</span>
            growth<span className="text-emerald-500">_os</span>
            <span className="text-emerald-500 opacity-45 font-light text-[17px]">]</span>
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center gap-9">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[0.67rem] tracking-[0.2em] uppercase text-zinc-500 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA - Right */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleSignIn}
              className="text-zinc-300 hover:text-white"
            >
              Sign in
            </Button>
            <Button
              onClick={handleStartJourney}
              className="bg-emerald-500 text-[#0a0a0a] hover:opacity-82 font-['var(--font-jetbrains-mono)'] font-bold text-[0.67rem] tracking-[0.15em] uppercase px-5 py-2"
            >
              Get Access
            </Button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-zinc-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-800 py-4"
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </div>

      <SignInModal 
        isOpen={signInModalOpen} 
        onClose={() => setSignInModalOpen(false)}
        callbackUrl="/onboarding"
      />
      <SignUpModal 
        isOpen={signUpModalOpen} 
        onClose={() => setSignUpModalOpen(false)}
        callbackUrl="/onboarding"
      />
    </header>
  )
}
