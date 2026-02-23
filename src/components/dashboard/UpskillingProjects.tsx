"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GapAnalysis } from "@/lib/types"
import { Code, Calendar, Target } from "lucide-react"

interface UpskillingProjectsProps {
  gapAnalysis: GapAnalysis
}

export function UpskillingProjects({ gapAnalysis }: UpskillingProjectsProps) {
  const projects = gapAnalysis?.upskillingProjects || []

  if (projects.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Suggested Upskilling Projects</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Specific projects to build or contribute to that will close your gaps.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, index) => (
          <Card key={index} className="bg-zinc-900/50 border-zinc-800 rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg font-semibold text-white flex-1">
                  {project.title}
                </CardTitle>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {project.timeline}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-zinc-300 leading-relaxed">{project.description}</p>
              </div>
              
              {project.skills && project.skills.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
                    Skills Developed
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs text-zinc-300 border-zinc-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.outcome && (
                <div>
                  <div className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-2">
                    Outcome
                  </div>
                  <p className="text-sm text-zinc-300">{project.outcome}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
