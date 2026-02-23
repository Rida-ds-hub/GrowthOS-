"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Github, Linkedin, Mail as MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmailSignUp } from "./EmailSignUp"
import { EmailSignIn } from "./EmailSignIn"

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  callbackUrl?: string
}

export function SignUpModal({ isOpen, onClose, callbackUrl = "/onboarding" }: SignUpModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isSignIn, setIsSignIn] = useState(false)

  const handleSignUp = async (provider: string) => {
    setIsLoading(provider)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      console.error("Sign up error:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleEmailSuccess = () => {
    onClose()
    window.location.href = callbackUrl
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {showEmailForm ? (isSignIn ? "Sign in to Growth OS" : "Create your Growth OS account") : "Create your Growth OS account"}
                </h2>
                <p className="text-zinc-400 text-sm">
                  {showEmailForm 
                    ? (isSignIn ? "Enter your credentials" : "Get started with your career growth journey")
                    : "Get started with your career growth journey"
                  }
                </p>
              </div>

              {showEmailForm ? (
                isSignIn ? (
                  <EmailSignIn 
                    onSuccess={handleEmailSuccess}
                    onSwitchToSignUp={() => setIsSignIn(false)}
                  />
                ) : (
                  <EmailSignUp 
                    onSuccess={handleEmailSuccess}
                    onSwitchToSignIn={() => setIsSignIn(true)}
                  />
                )
              ) : (
                <>
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleSignUp("google")}
                      disabled={isLoading !== null}
                      className="w-full bg-white text-black hover:bg-zinc-100 font-semibold"
                    >
                      {isLoading === "google" ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <MailIcon className="w-5 h-5 mr-2" />
                          Sign up with Google
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleSignUp("github")}
                      disabled={isLoading !== null}
                      className="w-full bg-zinc-800 text-white hover:bg-zinc-700 font-semibold border border-zinc-700"
                    >
                      {isLoading === "github" ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Github className="w-5 h-5 mr-2" />
                          Sign up with GitHub
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleSignUp("linkedin")}
                      disabled={isLoading !== null}
                      className="w-full bg-[#0077b5] text-white hover:bg-[#006399] font-semibold"
                    >
                      {isLoading === "linkedin" ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Linkedin className="w-5 h-5 mr-2" />
                          Sign up with LinkedIn
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-zinc-900 text-zinc-400">Or</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowEmailForm(true)}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <MailIcon className="w-4 h-4 mr-2" />
                    Sign up with Email
                  </Button>
                </>
              )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
