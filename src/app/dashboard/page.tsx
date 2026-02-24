import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"
import { AnimatedHeader } from "@/components/landing/AnimatedHeader"
import { ReadinessScore } from "@/components/dashboard/ReadinessScore"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { GapRadar } from "@/components/dashboard/GapRadar"
import { DomainBreakdowns } from "@/components/dashboard/DomainBreakdowns"
import { DataToScoreMapping } from "@/components/dashboard/DataToScoreMapping"
import { GapCards } from "@/components/dashboard/GapCards"
import { PlanTimeline } from "@/components/dashboard/PlanTimeline"
import { UpskillingProjects } from "@/components/dashboard/UpskillingProjects"
import { PostingStrategy } from "@/components/dashboard/PostingStrategy"
import { PromotionNarrative } from "@/components/dashboard/PromotionNarrative"
import { DataSources } from "@/components/dashboard/DataSources"
import { LockedSection } from "@/components/dashboard/LockedSection"
import { FeedbackWidget } from "@/components/dashboard/FeedbackWidget"
import { GapAnalysis } from "@/lib/types"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/")
  }

  const userId = session.user?.email || session.user?.name || "unknown"

  // Fetch user profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  // If profile doesn't exist, create a basic one
  if (!profile) {
    const { data: newProfile } = await supabase.from("profiles").upsert({
      user_id: userId,
      email: session.user?.email || null,
      name: session.user?.name || null,
      avatar_url: session.user?.image || null,
      updated_at: new Date().toISOString(),
    }).select().single()
    profile = newProfile
  }

  // Check if user has completed analysis
  const hasAnalysis = profile?.gap_analysis && 
    typeof profile.gap_analysis === 'object' && 
    Object.keys(profile.gap_analysis).length > 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AnimatedHeader />
      
      {/* Dashboard Header Info */}
      <div className="pt-20 pb-4 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {hasAnalysis ? (
              <>
                <div className="text-sm text-zinc-300">
                  <span className="font-medium text-white">{profile?.current_role || "Current Role"}</span>
                  <span className="mx-2 text-zinc-500">→</span>
                  <span className="font-medium text-white">{profile?.target_role || "Target Role"}</span>
                  <span className="mx-2 text-zinc-500">in</span>
                  <span className="font-medium text-emerald-400">{profile?.timeline || "Timeline"}</span>
                </div>
                <ReadinessScore score={(profile?.gap_analysis as GapAnalysis)?.readinessScore || 0} />
              </>
            ) : (
              <div className="w-full">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Complete your gap analysis</h3>
                    <p className="text-zinc-400 text-sm">Run your first analysis to see your personalized dashboard.</p>
                  </div>
                  <a
                    href="/onboarding"
                    className="bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-emerald-400 transition-colors whitespace-nowrap"
                  >
                    Start Analysis →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <main className="max-w-[95vw] mx-auto px-6 py-8 space-y-8">
        {!hasAnalysis ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Welcome to Growth OS
            </h2>
            <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
              Get started by completing your gap analysis. Connect your GitHub, LinkedIn, and resume to receive a personalized 90-day roadmap.
            </p>
            <a
              href="/onboarding"
              className="inline-block bg-emerald-500 text-black font-semibold px-8 py-3 rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Start Your Gap Analysis →
            </a>
          </div>
        ) : (
          <>
            {/* Section A - Data Sources */}
            <DataSources
              githubData={profile?.github_data_text || profile?.github_data}
              linkedinData={profile?.linkedin_data || profile?.linkedin_raw}
              resumeText={profile?.resume_text || profile?.resume_raw}
              websiteUrl={profile?.website_url}
            />

            {/* Section B - Summary Card */}
            <SummaryCard gapAnalysis={profile?.gap_analysis as GapAnalysis} />

            {/* Section C - Gap Radar */}
            <GapRadar gapAnalysis={profile?.gap_analysis as GapAnalysis} />

            {/* Section D - Domain Score Breakdowns */}
            <DomainBreakdowns gapAnalysis={profile?.gap_analysis as GapAnalysis} />

            {/* Section D.5 - Data to Score Mapping */}
            <DataToScoreMapping
              gapAnalysis={profile?.gap_analysis as GapAnalysis}
              githubData={profile?.github_data_text || profile?.github_data}
              linkedinData={profile?.linkedin_data || profile?.linkedin_raw}
              resumeText={profile?.resume_text || profile?.resume_raw}
              websiteUrl={profile?.website_url}
            />

            {/* Section E - Gap Detail Cards */}
            <GapCards gapAnalysis={profile?.gap_analysis as GapAnalysis} />

            {/* Section F - 90-Day Plan */}
            <PlanTimeline gapAnalysis={profile?.gap_analysis as GapAnalysis} />

            {/* Section G - Upskilling Projects */}
            <UpskillingProjects gapAnalysis={profile?.gap_analysis as GapAnalysis} />

            {/* Section H - Posting Strategy */}
            <PostingStrategy gapAnalysis={profile?.gap_analysis as GapAnalysis} />

            {/* Section I - Promotion Narrative */}
            <PromotionNarrative gapAnalysis={profile?.gap_analysis as GapAnalysis} />

            {/* Section G - Locked Sections */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary mb-4">Coming Soon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <LockedSection
                  title="Daily Design Drill"
                  description="Train decision-making daily. Design before code."
                  principle="Upskilling"
                  featureName="daily-design-drill"
                />
                <LockedSection
                  title="Impact Bank"
                  description="Capture measurable impact in real time."
                  principle="Evidence"
                  featureName="impact-bank"
                />
                <LockedSection
                  title="Promotion Readiness Score"
                  description="Compile your promotion case automatically."
                  principle="Narrative"
                  featureName="promotion-readiness-score"
                />
                <LockedSection
                  title="LinkedIn Post Generator"
                  description="Turn commits into LinkedIn proof."
                  principle="Branding"
                  featureName="linkedin-post-generator"
                />
                <LockedSection
                  title="Resume Impact Bullets"
                  description="Auto-generate bullets from your work."
                  principle="Evidence + Narrative"
                  featureName="resume-impact-bullets"
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Section G - Feedback Widget */}
      <FeedbackWidget />
    </div>
  )
}
