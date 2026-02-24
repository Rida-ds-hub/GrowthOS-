import { Suspense } from "react"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  
  // If user is signed in and Supabase is configured, check if they already have results
  if (session && supabase) {
    const userId = session.user?.email || session.user?.name || "unknown"
    
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("gap_analysis")
        .eq("user_id", userId)
        .single()
      
      // If they have results, redirect to dashboard
      if (profile?.gap_analysis) {
        redirect("/dashboard")
      }
    } catch (error) {
      // If error, continue to onboarding
      console.error("Error checking profile:", error)
    }
  }
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  )
}
