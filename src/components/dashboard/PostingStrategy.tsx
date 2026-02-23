"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GapAnalysis } from "@/lib/types"
import { MessageSquare, Calendar, Hash } from "lucide-react"

interface PostingStrategyProps {
  gapAnalysis: GapAnalysis
}

export function PostingStrategy({ gapAnalysis }: PostingStrategyProps) {
  const strategy = gapAnalysis?.postingStrategy

  if (!strategy) {
    return null
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          Posting Strategy
        </CardTitle>
        <p className="text-sm text-zinc-400 mt-2">
          Build visibility and demonstrate thought leadership through strategic content.
        </p>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategy.frequency && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">Frequency</div>
                <div className="text-sm font-medium text-white">{strategy.frequency}</div>
              </div>
            </div>
          )}

          {strategy.platforms && strategy.platforms.length > 0 && (
            <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
              <div className="text-xs text-zinc-400 uppercase tracking-wide mb-2">Platforms</div>
              <div className="flex flex-wrap gap-2">
                {strategy.platforms.map((platform, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs text-zinc-300 border-zinc-700">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {strategy.contentTypes && strategy.contentTypes.length > 0 && (
          <div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Content Types
            </div>
            <ul className="space-y-1">
              {strategy.contentTypes.map((type, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>{type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {strategy.topics && strategy.topics.length > 0 && (
          <div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Hash className="w-3 h-3" />
              Topics to Cover
            </div>
            <div className="flex flex-wrap gap-2">
              {strategy.topics.map((topic, idx) => (
                <Badge key={idx} variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {strategy.nextPosts && strategy.nextPosts.length > 0 && (
          <div>
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-2">
              Next Post Ideas
            </div>
            <ul className="space-y-2">
              {strategy.nextPosts.map((post, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2 p-2 rounded bg-zinc-950/50 border border-zinc-800">
                  <span className="text-emerald-500 mt-1">→</span>
                  <span>{post}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
