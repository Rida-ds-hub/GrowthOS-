"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface StepGoalProps {
  onContinue: (data: {
    currentRole: string
    targetRole: string
    yearsExp: number
    timeline: string
    progressionIntent: "same_company" | "new_company" | "founder" | "pivot"
  }) => void
  initialData?: {
    progressionIntent?: "same_company" | "new_company" | "founder" | "pivot"
  }
}

export function StepGoal({ onContinue, initialData }: StepGoalProps) {
  const [currentRole, setCurrentRole] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [yearsExp, setYearsExp] = useState<number | "">("")
  const [timeline, setTimeline] = useState("")
  const [progressionIntent, setProgressionIntent] = useState<"same_company" | "new_company" | "founder" | "pivot">(
    initialData?.progressionIntent || "same_company"
  )

  const timelines = ["3 months", "6 months", "9 months", "12 months"]
  const progressionOptions = [
    { value: "same_company" as const, label: "Grow in current company", desc: "Internal promotion or role expansion" },
    { value: "new_company" as const, label: "Move to a new company", desc: "External opportunity" },
    { value: "founder" as const, label: "Start something of my own", desc: "Build your own venture" },
    { value: "pivot" as const, label: "Pivot role/track in tech", desc: "Switch focus area or domain" },
  ]

  const isValid =
    currentRole.trim() &&
    targetRole.trim() &&
    yearsExp !== "" &&
    timeline !== "" &&
    progressionIntent !== ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onContinue({
        currentRole: currentRole.trim(),
        targetRole: targetRole.trim(),
        yearsExp: Number(yearsExp),
        timeline,
        progressionIntent,
      })
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6 max-w-2xl mx-auto">
      <CardContent className="p-0 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Set Your Goal
          </h2>
          <p className="text-zinc-300">
            Tell us where you are and where you want to be.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="currentRole">Current Role</Label>
            <Input
              id="currentRole"
              placeholder="e.g., Software Engineer II"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="bg-zinc-950 border-zinc-700 focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role</Label>
            <Input
              id="targetRole"
              placeholder="e.g., Senior Software Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="bg-zinc-950 border-zinc-700 focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsExp">Years of Experience</Label>
            <Input
              id="yearsExp"
              type="number"
              min="0"
              max="50"
              placeholder="e.g., 3"
              value={yearsExp}
              onChange={(e) =>
                setYearsExp(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="bg-zinc-950 border-zinc-700 focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Timeline</Label>
            <div className="flex flex-wrap gap-2">
              {timelines.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeline(t)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      timeline === t
                        ? "bg-emerald-500 text-black"
                        : "bg-zinc-950 border border-zinc-700 text-zinc-300 hover:border-emerald-500/50"
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Direction of Progression</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {progressionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setProgressionIntent(option.value)}
                  className={`
                    p-4 rounded-lg border text-left transition-colors
                    ${
                      progressionIntent === option.value
                        ? "bg-emerald-500/10 border-emerald-500 text-white"
                        : "bg-zinc-950 border-zinc-700 text-zinc-300 hover:border-emerald-500/50"
                    }
                  `}
                >
                  <div className="font-medium mb-1">{option.label}</div>
                  <div className="text-xs text-zinc-400">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
          >
            Continue →
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
