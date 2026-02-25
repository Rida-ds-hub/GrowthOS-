"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Check, X } from "lucide-react"

interface StepResumeProps {
  onContinue: (resumeText: string) => void
}

export function StepResume({ onContinue }: StepResumeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to parse resume")
      }

      const data = await response.json()
      setResumeText(data.text)
    } catch (err) {
      setError("Failed to parse resume. Please try again.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setResumeText(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleContinue = () => {
    onContinue(resumeText || "")
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6 max-w-2xl mx-auto">
      <CardContent className="p-0 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Upload Resume
          </h2>
          <p className="text-zinc-300">
            Upload your resume to enhance the gap analysis. This is optional.
          </p>
        </div>

        {!resumeText ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${
                isDragging
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-zinc-700 bg-zinc-950/50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-3">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-zinc-300">Parsing resume...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-zinc-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    Drag and drop your resume PDF here
                  </p>
                  <p className="text-xs text-zinc-400">or</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Browse Files
                  </Button>
                </div>
                <p className="text-xs text-zinc-400">
                  PDF files only, max 10MB
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-400">
                  Resume parsed successfully
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {resumeText.length} characters extracted
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onContinue("")}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={() => onContinue(resumeText || "")}
            className="flex-1 bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
          >
            Run Gap Analysis →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
