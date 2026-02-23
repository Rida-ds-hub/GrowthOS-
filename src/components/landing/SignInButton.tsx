"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export function SignInButton() {
  return (
    <Button
      onClick={() => signIn("github", { callbackUrl: "/onboarding" })}
      variant="outline"
      className="border-zinc-700 text-secondary hover:bg-zinc-900 hover:border-emerald-500/50"
    >
      <Github className="w-4 h-4 mr-2" />
      Sign in with GitHub
    </Button>
  )
}
