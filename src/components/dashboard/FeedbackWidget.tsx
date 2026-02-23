"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"bug" | "feature" | "general">("general")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.slice(0, 500),
          email: email || undefined,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setMessage("")
        setEmail("")
        setTimeout(() => {
          setOpen(false)
          setIsSubmitted(false)
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 bg-emerald-500 text-black hover:bg-emerald-400 font-semibold rounded-full px-6 py-3 shadow-lg z-50"
        >
          Share Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>Share Feedback</DialogTitle>
          <DialogDescription>
            Your feedback shapes what we build next.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) =>
                setType(e.target.value as "bug" | "feature" | "general")
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="bug">Bug</option>
              <option value="feature">Feature Request</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us what you think..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              className="bg-zinc-950 border-zinc-700"
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-950 border-zinc-700"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!message.trim() || isSubmitting || isSubmitted}
              className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
            >
              {isSubmitted
                ? "Thank you!"
                : isSubmitting
                ? "Submitting..."
                : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
