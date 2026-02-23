"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo/Logo"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { SignInModal } from "@/components/auth/SignInModal"
import { SignUpModal } from "@/components/auth/SignUpModal"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center">
            <Logo variant="nav" size="nav" />
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
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
              className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
            >
              Start your journey
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
