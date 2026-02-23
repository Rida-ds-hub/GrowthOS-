"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Github, Linkedin, Mail as MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmailSignIn } from "./EmailSignIn"
import { EmailSignUp } from "./EmailSignUp"

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  callbackUrl?: string
}

export function SignInModal({ isOpen, onClose, callbackUrl = "/onboarding" }: SignInModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleEmailSuccess = () => {
    onClose()
    window.location.href = callbackUrl
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          pointerEvents: 'auto'
        }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full z-[10000] my-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'relative', marginTop: 'auto', marginBottom: 'auto' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {showEmailForm ? (isSignUp ? "Create account" : "Sign in to Growth OS") : "Sign in to Growth OS"}
                </h2>
                <p className="text-zinc-400 text-sm">
                  {showEmailForm 
                    ? (isSignUp ? "Create your account to save your progress" : "Enter your credentials")
                    : "Choose your preferred sign-in method"
                  }
                </p>
              </div>

              {showEmailForm ? (
                isSignUp ? (
                  <EmailSignUp 
                    onSuccess={handleEmailSuccess}
                    onSwitchToSignIn={() => setIsSignUp(false)}
                  />
                ) : (
                  <EmailSignIn 
                    onSuccess={handleEmailSuccess}
                    onSwitchToSignUp={() => setIsSignUp(true)}
                  />
                )
              ) : (
                <>
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleSignIn("google")}
                      disabled={isLoading !== null}
                      className="w-full bg-white text-black hover:bg-zinc-100 font-semibold"
                    >
                      {isLoading === "google" ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <MailIcon className="w-5 h-5 mr-2" />
                          Continue with Google
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleSignIn("github")}
                      disabled={isLoading !== null}
                      className="w-full bg-zinc-800 text-white hover:bg-zinc-700 font-semibold border border-zinc-700"
                    >
                      {isLoading === "github" ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Github className="w-5 h-5 mr-2" />
                          Continue with GitHub
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleSignIn("linkedin")}
                      disabled={isLoading !== null}
                      className="w-full bg-[#0077b5] text-white hover:bg-[#006399] font-semibold"
                    >
                      {isLoading === "linkedin" ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Linkedin className="w-5 h-5 mr-2" />
                          Continue with LinkedIn
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
                    Continue with Email
                  </Button>
                </>
              )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
