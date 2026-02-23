"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function SharedResultsPage() {
  const params = useParams()
  const router = useRouter()
  const shareId = params.shareId as string

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/share-results?id=${shareId}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          router.push("/?error=share-expired")
          return
        }

        const { data } = await response.json()

        // Redirect to a view-only results page
        router.push(`/results/view?data=${encodeURIComponent(JSON.stringify(data))}`)
      } catch (error) {
        console.error("Error loading shared results:", error)
        router.push("/?error=share-invalid")
      }
    }

    if (shareId) {
      fetchResults()
    }
  }, [shareId, router])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
