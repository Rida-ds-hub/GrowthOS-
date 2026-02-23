"use client"

import { useState } from "react"
import { supabaseBrowser } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2 } from "lucide-react"

interface EmailSignInProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
}

export function EmailSignIn({ onSuccess, onSwitchToSignUp }: EmailSignInProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!supabaseBrowser) {
      setError("Email authentication is not configured. Please use Google, GitHub, or LinkedIn to sign in.")
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signInError } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message || "Invalid email or password")
      } else {
        // Reload page to sync session
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
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="email"
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
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      {onSwitchToSignUp && (
        <p className="text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Sign up
          </button>
        </p>
      )}
    </form>
  )
}
