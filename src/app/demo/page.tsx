"use client"

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

// Demo data
const demoGapAnalysis: GapAnalysis = {
  summary: "You're a strong individual contributor with solid technical skills. To reach the next level, focus on demonstrating system design expertise through real projects and building your technical brand. Your communication skills are already strong—leverage them to showcase your technical depth.",
  readinessScore: 72,
  domainScores: {
    "System Design Maturity": 65,
    "Execution Scope": 78,
    "Communication & Visibility": 82,
    "Technical Depth": 75,
    "Leadership & Influence": 58,
  },
  domainBreakdowns: {
    "System Design Maturity": {
      score: 65,
      range: "moderate",
      explanation: "Strong foundation in microservices architecture, but limited experience with distributed systems at scale.",
      evidence: ["Built microservices for internal tools", "Designed API architecture for team project"],
      dataContributions: [
        {
          source: "github",
          contribution: "Shows experience with microservices but no large-scale distributed systems",
          impact: "medium"
        },
        {
          source: "resume",
          contribution: "Mentions system design but lacks specific examples of distributed systems",
          impact: "low"
        }
      ],
      nextSteps: ["Design a distributed caching system", "Write technical blog post on system design"]
    },
    "Brand Presence": {
      score: 45,
      range: "needs-improvement",
      explanation: "Minimal public presence. Only 3 LinkedIn posts in the last year, no technical blog posts.",
      evidence: ["3 LinkedIn posts in past year", "No technical blog"],
      dataContributions: [
        {
          source: "linkedin",
          contribution: "Minimal posting activity, no technical content",
          impact: "high"
        },
        {
          source: "github",
          contribution: "Active but no public documentation or blog posts",
          impact: "medium"
        }
      ],
      nextSteps: ["Post 2 LinkedIn posts per month", "Start technical blog"]
    }
  },
  gaps: [
    {
      domain: "System Design Maturity",
      gap: "moderate",
      observation: "Strong foundation in microservices architecture, but limited experience with distributed systems at scale.",
      requirement: "Design and implement a distributed caching layer for a high-traffic service handling 1M+ requests/day.",
      closingAction: "Build a distributed caching system project and document design decisions."
    },
    {
      domain: "Brand Presence",
      gap: "high",
      observation: "Minimal public presence. Only 3 LinkedIn posts in the last year, no technical blog posts.",
      requirement: "Establish consistent technical presence: 2 LinkedIn posts/month, 1 technical blog post/quarter showcasing system design decisions.",
      closingAction: "Create content calendar and start posting technical insights weekly."
    },
  ],
  plan: {
    phase1: {
      label: "Phase 1",
      theme: "Foundation (Days 1-30)",
      actions: [
        "Complete system design course on distributed systems",
        "Design a distributed caching system architecture document",
        "Write first technical blog post on microservices patterns",
        "Post on LinkedIn about a recent technical challenge solved"
      ],
      specificTasks: [
        "Task: Complete distributed systems course",
        "Task: Design caching system architecture",
        "Task: Write technical blog post",
        "Task: Create LinkedIn post"
      ],
      deliverables: [
        "System design architecture document",
        "First technical blog post published",
        "LinkedIn post published"
      ]
    },
    phase2: {
      label: "Phase 2",
      theme: "Build (Days 31-60)",
      actions: [
        "Implement distributed caching layer in a side project",
        "Document design decisions and trade-offs",
        "Share progress updates on LinkedIn (2 posts)",
        "Contribute to open-source project related to distributed systems"
      ],
      specificTasks: [
        "Task: Implement caching layer",
        "Task: Document design decisions",
        "Task: Post on LinkedIn",
        "Task: Contribute to open source"
      ],
      deliverables: [
        "Working distributed caching system",
        "Design documentation",
        "2 LinkedIn posts",
        "Open source contribution"
      ]
    },
    phase3: {
      label: "Phase 3",
      theme: "Showcase (Days 61-90)",
      actions: [
        "Deploy distributed system to production",
        "Write case study blog post with metrics",
        "Present findings in team meeting",
        "Update resume with measurable impact"
      ],
      specificTasks: [
        "Task: Deploy to production",
        "Task: Write case study",
        "Task: Present to team",
        "Task: Update resume"
      ],
      deliverables: [
        "Production deployment",
        "Case study blog post",
        "Team presentation",
        "Updated resume"
      ]
    },
  },
  upskillingProjects: [
    {
      title: "Build a Distributed Caching System",
      description: "Design and implement Redis-like caching layer with replication and sharding",
      timeline: "4-6 weeks",
      skills: ["Distributed Systems", "System Design", "Go/Python"],
      outcome: "Demonstrate system design expertise with a working project"
    },
    {
      title: "Technical Blog Series",
      description: "Write 3-part series on microservices patterns and trade-offs",
      timeline: "2-3 weeks",
      skills: ["Technical Writing", "System Design", "Communication"],
      outcome: "Establish technical thought leadership"
    },
  ],
  postingStrategy: {
    frequency: "2 posts per month",
    contentTypes: ["Technical insights", "Project updates", "Lessons learned"],
    platforms: ["LinkedIn"],
    topics: [
      "System design decisions from your projects",
      "Lessons learned from building distributed systems",
      "Technical challenges and how you solved them",
    ],
    nextPosts: [
      "How I designed a distributed caching layer",
      "Lessons from building microservices at scale",
      "System design trade-offs: consistency vs availability"
    ]
  },
  promotionNarrative: "You're a strong individual contributor with solid technical skills. To reach the next level, focus on demonstrating system design expertise through real projects and building your technical brand. Your communication skills are already strong—leverage them to showcase your technical depth."
}

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AnimatedHeader />
      
      {/* Dashboard Header Info */}
      <div className="pt-20 pb-4 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-zinc-300">
              <span className="font-medium text-white">Senior Software Engineer</span>
              <span className="mx-2 text-zinc-500">→</span>
              <span className="font-medium text-white">Staff Engineer</span>
              <span className="mx-2 text-zinc-500">in</span>
              <span className="font-medium text-emerald-400">90 days</span>
            </div>
            <ReadinessScore score={demoGapAnalysis.readinessScore} />
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <main className="max-w-[95vw] mx-auto px-6 py-8 space-y-8">
        {/* Section A - Data Sources */}
        <DataSources
          githubData="Demo GitHub profile data - 15 repositories, 200+ contributions"
          linkedinData="Demo LinkedIn profile data - Software Engineer at Tech Corp"
          resumeText="Demo resume text - 5 years experience in backend development"
          websiteUrl="https://example.com"
        />

        {/* Section B - Summary Card */}
        <SummaryCard gapAnalysis={demoGapAnalysis} />

        {/* Section C - Gap Radar */}
        <GapRadar gapAnalysis={demoGapAnalysis} />

        {/* Section D - Domain Score Breakdowns */}
        <DomainBreakdowns gapAnalysis={demoGapAnalysis} />

        {/* Section D.5 - Data to Score Mapping */}
        <DataToScoreMapping
          gapAnalysis={demoGapAnalysis}
          githubData="Demo GitHub data"
          linkedinData="Demo LinkedIn data"
          resumeText="Demo resume text"
          websiteUrl="https://example.com"
        />

        {/* Section E - Gap Detail Cards */}
        <GapCards gapAnalysis={demoGapAnalysis} />

        {/* Section F - 90-Day Plan */}
        <PlanTimeline gapAnalysis={demoGapAnalysis} />

        {/* Section G - Upskilling Projects */}
        <UpskillingProjects gapAnalysis={demoGapAnalysis} />

        {/* Section H - Posting Strategy */}
        <PostingStrategy gapAnalysis={demoGapAnalysis} />

        {/* Section I - Promotion Narrative */}
        <PromotionNarrative gapAnalysis={demoGapAnalysis} />

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
      </main>

      {/* Section G - Feedback Widget */}
      <FeedbackWidget />
    </div>
  )
}
