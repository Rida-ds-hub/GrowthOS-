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
  }) => void
}

export function StepGoal({ onContinue }: StepGoalProps) {
  const [currentRole, setCurrentRole] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [yearsExp, setYearsExp] = useState<number | "">("")
  const [timeline, setTimeline] = useState("")

  const timelines = ["3 months", "6 months", "9 months", "12 months"]

  const isValid =
    currentRole.trim() &&
    targetRole.trim() &&
    yearsExp !== "" &&
    timeline !== ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onContinue({
        currentRole: currentRole.trim(),
        targetRole: targetRole.trim(),
        yearsExp: Number(yearsExp),
        timeline,
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
