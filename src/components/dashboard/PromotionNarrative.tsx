"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GapAnalysis } from "@/lib/types"

interface PromotionNarrativeProps {
  gapAnalysis: GapAnalysis
}

export function PromotionNarrative({ gapAnalysis }: PromotionNarrativeProps) {
  if (!gapAnalysis || !gapAnalysis.promotionNarrative) {
    return (
      <Card className="bg-zinc-950 border-zinc-800 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            Your Promotion Story
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">No promotion narrative available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-950 border-zinc-800 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white">
          Your Promotion Story
        </CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="border-l-4 border-emerald-500 pl-6 py-2 text-zinc-300 leading-relaxed italic">
          {gapAnalysis.promotionNarrative}
        </blockquote>
      </CardContent>
    </Card>
  )
}
