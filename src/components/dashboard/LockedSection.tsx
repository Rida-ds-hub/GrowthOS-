"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { useState } from "react"

interface LockedSectionProps {
  title: string
  description: string
  principle: string
  featureName: string
}

export function LockedSection({
  title,
  description,
  principle,
  featureName,
}: LockedSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleNotify = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "interest",
          message: `Interested in: ${title}`,
          page: featureName,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error("Failed to submit interest:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl relative overflow-hidden">
      {/* Blurred overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60 rounded-2xl flex items-center justify-center z-10">
        <div className="text-center">
          <Lock className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-emerald-500 mb-2">
            Coming Soon
          </div>
        </div>
      </div>

      {/* Content (blurred) */}
      <CardHeader className="pb-3 opacity-30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-primary">
            {title}
          </CardTitle>
          <span className="text-xs font-medium text-emerald-500/50 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {principle}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-secondary opacity-30">{description}</p>
        <Button
          onClick={handleNotify}
          disabled={isSubmitting || isSubmitted}
          className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold relative z-20"
        >
          {isSubmitted
            ? "✓ Notified"
            : isSubmitting
            ? "Submitting..."
            : "Notify me when this launches"}
        </Button>
      </CardContent>
    </Card>
  )
}
