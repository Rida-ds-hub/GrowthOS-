"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Linkedin, Check, ExternalLink } from "lucide-react"

interface StepConnectProps {
  onContinue: (data: {
    githubConnected: boolean
    linkedinConnected: boolean
    websiteUrl?: string
  }) => void
}

const STORAGE_KEY = "growthos_onboarding_data"

export function StepConnect({ onContinue }: StepConnectProps) {
  const { data: session } = useSession()
  const [githubConnected, setGithubConnected] = useState(false)
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [githubUsername, setGithubUsername] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")

  useEffect(() => {
    // Load from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (data.githubConnected) setGithubConnected(true)
          if (data.linkedinConnected) setLinkedinConnected(true)
          if (data.websiteUrl) setWebsiteUrl(data.websiteUrl)
          if (data.githubUsername) setGithubUsername(data.githubUsername)
          if (data.linkedinUrl) setLinkedinUrl(data.linkedinUrl)
        } catch {}
      }
    }

    // Check if user signed in with GitHub - if so, GitHub is already connected
    if (session?.user && (session as any).provider === "github") {
      setGithubConnected(true)
    } else if ((session as any)?.githubAccessToken) {
      // Or if they have a GitHub access token from connecting separately
      setGithubConnected(true)
    }
    
    // Check if user signed in with LinkedIn - if so, LinkedIn is already connected
    if (session?.user && (session as any).provider === "linkedin") {
      setLinkedinConnected(true)
    } else if ((session as any)?.linkedinAccessToken) {
      // Or if they have a LinkedIn access token from connecting separately
      setLinkedinConnected(true)
    }
  }, [session])

  const handleGitHubConnect = () => {
    // If authenticated, connect GitHub via OAuth
    if (session) {
      signIn("github", { callbackUrl: "/onboarding" })
    } else {
      // For unauthenticated users, we'll use the username input below
      // Just focus on the input field
      const input = document.getElementById("github-username")
      input?.focus()
    }
  }

  const handleLinkedInConnect = () => {
    // If authenticated, connect LinkedIn via OAuth
    if (session) {
      signIn("linkedin", { callbackUrl: "/onboarding" })
    } else {
      // For unauthenticated users, we'll use the URL input below
      // Just focus on the input field
      const input = document.getElementById("linkedin-url")
      input?.focus()
    }
  }

  const handleContinue = () => {
    const continueData = {
      githubConnected: githubConnected || !!githubUsername.trim(),
      linkedinConnected: linkedinConnected || !!linkedinUrl.trim(),
      websiteUrl: websiteUrl.trim() || undefined,
      githubUsername: githubUsername.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
    }
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      const data = stored ? JSON.parse(stored) : {}
      Object.assign(data, continueData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
    
    onContinue(continueData)
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6 max-w-2xl mx-auto">
      <CardContent className="p-0 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Connect Your Accounts
          </h2>
          <p className="text-zinc-300">
            Connect additional accounts to enhance your gap analysis. If you signed in with GitHub or LinkedIn, they're already connected. All fields are optional.
          </p>
        </div>

        <div className="space-y-4">
          {/* GitHub */}
          <div className="space-y-2">
            <Label>GitHub</Label>
            {session ? (
              // Authenticated: OAuth connection
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={handleGitHubConnect}
                  disabled={githubConnected}
                  className={`
                    flex-1 bg-zinc-950 border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-emerald-500/50
                    ${githubConnected && "opacity-50 cursor-not-allowed"}
                  `}
                >
                  {githubConnected ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-emerald-500" />
                      Connected as @{session?.user?.name || "user"}
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 mr-2" />
                      Connect GitHub
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Unauthenticated: Username input
              <div className="flex items-center gap-3">
                <Input
                  id="github-username"
                  type="text"
                  placeholder="Enter GitHub username (e.g., octocat)"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="flex-1 bg-zinc-950 border-zinc-700 text-white focus:border-emerald-500"
                />
                {githubUsername && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(`https://github.com/${githubUsername}`, "_blank")}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
            <p className="text-xs text-zinc-400">
              {session 
                ? "Unlocks: Repository analysis, commit history, language distribution"
                : "Enter your GitHub username to analyze your public repositories"}
            </p>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            {session ? (
              // Authenticated: OAuth connection
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={handleLinkedInConnect}
                  disabled={linkedinConnected}
                  className={`
                    flex-1 bg-zinc-950 border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-emerald-500/50
                    ${linkedinConnected && "opacity-50 cursor-not-allowed"}
                  `}
                >
                  {linkedinConnected ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-emerald-500" />
                      Connected
                    </>
                  ) : (
                    <>
                      <Linkedin className="w-4 h-4 mr-2" />
                      Connect LinkedIn
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Unauthenticated: Profile URL input
              <div className="flex items-center gap-3">
                <Input
                  id="linkedin-url"
                  type="url"
                  placeholder="Enter LinkedIn profile URL"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="flex-1 bg-zinc-950 border-zinc-700 text-white focus:border-emerald-500"
                />
                {linkedinUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(linkedinUrl, "_blank")}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
            <p className="text-xs text-zinc-400">
              {session
                ? "Unlocks: Professional background, experience timeline, skills"
                : "Enter your LinkedIn profile URL to analyze your professional background"}
            </p>
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="bg-zinc-950 border-zinc-700 focus:border-emerald-500"
              />
              {websiteUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(websiteUrl, "_blank")}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleContinue}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            className="flex-1 bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
          >
            Continue →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
