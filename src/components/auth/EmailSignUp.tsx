"use client"

import { useState } from "react"
import { supabaseBrowser } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2 } from "lucide-react"

interface EmailSignUpProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

export function EmailSignUp({ onSuccess, onSwitchToSignIn }: EmailSignUpProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    if (!supabaseBrowser) {
      setError("Email authentication is not configured. Please use Google, GitHub, or LinkedIn to sign up.")
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        // Success - reload page to sync session
        onSuccess?.()
        // Small delay to ensure session is set
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-700 focus:border-emerald-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-700 focus:border-emerald-500"
            required
            minLength={8}
          />
        </div>
        <p className="text-xs text-zinc-400">At least 8 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-700 focus:border-emerald-500"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      {onSwitchToSignIn && (
        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Sign in
          </button>
        </p>
      )}
    </form>
  )
}
