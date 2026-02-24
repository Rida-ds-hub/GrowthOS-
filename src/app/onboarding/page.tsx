import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  
  // If user is signed in, check if they already have results
  if (session) {
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
  
  return <OnboardingWizard />
}
