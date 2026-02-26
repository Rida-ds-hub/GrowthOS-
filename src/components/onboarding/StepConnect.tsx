"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Github, ExternalLink, FileText } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { normalizeWebsiteUrl, isSafeWebsiteUrl } from "@/lib/url-utils"

interface StepConnectProps {
  onContinue: (data: {
    githubConnected: boolean
    linkedinConnected: boolean
    websiteUrl?: string
    githubUsername?: string
    linkedinManualData?: string
  }) => void
}

const STORAGE_KEY = "growthos_onboarding_data"

export function StepConnect({ onContinue }: StepConnectProps) {
  const [githubUsername, setGithubUsername] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [linkedinManualData, setLinkedinManualData] = useState("")
  const [showLinkedInManual, setShowLinkedInManual] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (data.githubUsername) setGithubUsername(data.githubUsername)
          if (data.websiteUrl) setWebsiteUrl(data.websiteUrl)
          if (data.linkedinManualData) {
            setLinkedinManualData(data.linkedinManualData)
            setShowLinkedInManual(true)
          }
        } catch {}
      }
    }
  }, [])

  const handleContinue = () => {
    const rawWebsite = websiteUrl.trim()
    const continueData = {
      githubConnected: !!githubUsername.trim(),
      linkedinConnected: !!linkedinManualData.trim(),
      websiteUrl: rawWebsite ? normalizeWebsiteUrl(rawWebsite) : undefined,
      githubUsername: githubUsername.trim() || undefined,
      linkedinManualData: linkedinManualData.trim() || undefined,
    }
    
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
            Connect Your Data
          </h2>
          <p className="text-zinc-300">
            The more data you provide, the better your analysis. All fields are optional — but GitHub + resume gives the strongest results.
          </p>
        </div>

        <div className="space-y-4">
          {/* GitHub */}
          <div className="space-y-2">
            <Label>GitHub Username</Label>
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
            <p className="text-xs text-zinc-400">
              We&apos;ll analyze your public repositories, languages, and commit patterns.
            </p>
          </div>

          {/* LinkedIn (manual paste) */}
          <div className="space-y-2">
            <Label>LinkedIn Profile Data (Optional)</Label>
            {!showLinkedInManual ? (
              <div className="p-4 bg-zinc-950 border border-zinc-700 rounded-lg">
                <p className="text-sm text-zinc-300 mb-3">
                  Paste your LinkedIn experience, education, and skills to enrich the analysis.
                </p>
                <Button
                  type="button"
                  onClick={() => setShowLinkedInManual(true)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-emerald-500/50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Paste LinkedIn Data
                </Button>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Paste your LinkedIn profile information here (experience, education, skills, certifications, etc.)"
                  value={linkedinManualData}
                  onChange={(e) => setLinkedinManualData(e.target.value)}
                  className="bg-zinc-950 border-zinc-700 text-white focus:border-emerald-500 min-h-[150px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowLinkedInManual(false)
                    setLinkedinManualData("")
                  }}
                  className="w-full text-xs text-zinc-400 hover:text-zinc-300"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website / Portfolio URL (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="websiteUrl"
                type="text"
                placeholder="yourwebsite.com or https://..."
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="bg-zinc-950 border-zinc-700 focus:border-emerald-500"
              />
              {websiteUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const normalized = normalizeWebsiteUrl(websiteUrl.trim())
                    if (isSafeWebsiteUrl(websiteUrl)) window.open(normalized, "_blank")
                  }}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-zinc-400">
              No personal site? You can use your newsletter (e.g. Substack or Medium) URL instead.
            </p>
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
