// Core types for GrowthOS

export interface DataSourceContribution {
  source: "github" | "linkedin" | "resume" | "website";
  contribution: string;
  impact: "high" | "medium" | "low";
}

export interface DomainScoreBreakdown {
  score: number;
  range: "excellent" | "strong" | "moderate" | "needs-improvement";
  explanation: string;
  evidence: string[];
  dataContributions?: DataSourceContribution[];
  nextSteps: string[];
}

export interface GapAnalysis {
  summary: string;
  readinessScore: number; // 0–100
  domainScores: {
    "System Design Maturity": number;
    "Execution Scope": number;
    "Communication & Visibility": number;
    "Technical Depth": number;
    "Leadership & Influence": number;
  };
  domainBreakdowns?: {
    "System Design Maturity"?: DomainScoreBreakdown;
    "Execution Scope"?: DomainScoreBreakdown;
    "Communication & Visibility"?: DomainScoreBreakdown;
    "Technical Depth"?: DomainScoreBreakdown;
    "Leadership & Influence"?: DomainScoreBreakdown;
  };
  gaps: Array<{
    domain: string;
    gap: "high" | "medium" | "low";
    observation: string;
    requirement: string;
    closingAction: string;
  }>;
  plan: {
    phase1: { 
      label: string; 
      theme: string; 
      actions: string[];
      specificTasks?: string[];
      deliverables?: string[];
    };
    phase2: { 
      label: string; 
      theme: string; 
      actions: string[];
      specificTasks?: string[];
      deliverables?: string[];
    };
    phase3: { 
      label: string; 
      theme: string; 
      actions: string[];
      specificTasks?: string[];
      deliverables?: string[];
    };
  };
  upskillingProjects?: Array<{
    title: string;
    description: string;
    timeline: string;
    skills: string[];
    outcome: string;
  }>;
  postingStrategy?: {
    frequency: string;
    contentTypes: string[];
    platforms: string[];
    topics: string[];
    nextPosts: string[];
  };
  promotionNarrative: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  current_role?: string;
  target_role?: string;
  years_exp?: number;
  timeline?: string;
  github_data?: any;
  linkedin_raw?: string;
  resume_raw?: string;
  website_url?: string;
  gap_analysis?: GapAnalysis | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  type: "bug" | "feature" | "interest" | "general";
  message: string;
  page?: string;
  created_at: string;
}

export type GapSeverity = "high" | "medium" | "low";
