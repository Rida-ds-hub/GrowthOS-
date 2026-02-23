export const buildGapAnalysisPrompt = (data: {
  currentRole: string;
  targetRole: string;
  yearsExperience: number;
  timeline: string;
  progressionIntent?: "same_company" | "new_company" | "founder" | "pivot";
  githubData?: string;
  resumeText?: string;
  linkedinText?: string;
}) => {
  const intentLabels: Record<string, string> = {
    same_company: "Internal promotion/growth within current company",
    new_company: "External move to a new company",
    founder: "Starting own venture/company",
    pivot: "Pivoting role/track within tech",
  };
  
  return `
You are a senior engineering career strategist. You think in structured frameworks. No motivational language. No filler. Precision only.

PROFILE:
- Current Role: ${data.currentRole}
- Target Role: ${data.targetRole}
- Years of Experience: ${data.yearsExperience}
- Timeline: ${data.timeline}
- Progression Intent: ${intentLabels[data.progressionIntent || "same_company"]}

GitHub Data:
${data.githubData || "Not provided"}

Resume:
${data.resumeText || "Not provided"}

LinkedIn / Background:
${data.linkedinText || "Not provided"}

Analyse across 5 domains: System Design Maturity, Execution Scope, Communication & Visibility, Technical Depth, Leadership & Influence.

For each domain score, provide a breakdown explaining why that score, what range it falls into, evidence from their profile, and specific next steps.

CRITICAL: For each domain, you MUST include "dataContributions" showing how each data source (GitHub, LinkedIn, Resume, Website) contributed to that score. For example:
- If GitHub data was provided, explain how it influenced the score (e.g., "GitHub shows 12 repositories with distributed systems patterns, contributing to System Design Maturity")
- If LinkedIn data was provided, explain how professional experience contributed (e.g., "LinkedIn shows 5 years of team leadership, contributing to Leadership & Influence")
- If Resume was provided, explain how it contributed (e.g., "Resume demonstrates project execution across 3 companies, contributing to Execution Scope")
Only include dataContributions for sources that were actually provided.

Make a 3-phase execution plan (Phase 1, Phase 2, Phase 3). No specific calendar dates. Treat phases as ordered blocks: start with immediate fixes, then medium-term build, then proof/visibility. Each phase should have:
- Clear theme
- 3-5 specific, measurable actions (not generic advice)
- Ordered steps for that phase (no explicit dates)
- Deliverables (what they'll have completed)

Include suggested upskilling projects (specific projects they can build/contribute to) and a posting strategy (what to post, when, where).

Return ONLY valid JSON. No text before or after. Use this exact shape:

{
  "summary": "2-3 sentence honest assessment, no fluff",
  "readinessScore": <0-100>,
  "domainScores": {
    "System Design Maturity": <0-100>,
    "Execution Scope": <0-100>,
    "Communication & Visibility": <0-100>,
    "Technical Depth": <0-100>,
    "Leadership & Influence": <0-100>
  },
  "domainBreakdowns": {
    "System Design Maturity": {
      "score": <0-100>,
      "range": "excellent|strong|moderate|needs-improvement",
      "explanation": "Why this score (1-2 sentences)",
      "evidence": ["specific evidence 1", "specific evidence 2"],
      "dataContributions": [
        {
          "source": "github|linkedin|resume|website",
          "contribution": "How this data source contributed to the score (e.g., 'GitHub shows 5 repos with system design patterns, demonstrating X')",
          "impact": "high|medium|low"
        }
      ],
      "nextSteps": ["actionable step 1", "actionable step 2"]
    },
    "Execution Scope": { ... },
    "Communication & Visibility": { ... },
    "Technical Depth": { ... },
    "Leadership & Influence": { ... }
  },
  "gaps": [
    {
      "domain": "string",
      "gap": "high|medium|low",
      "observation": "what the evidence shows (bullet points preferred)",
      "requirement": "what the target role needs (bullet points preferred)",
      "closingAction": "single most effective action (specific and actionable)"
    }
  ],
  "plan": {
    "phase1": { 
      "label": "Phase 1", 
      "theme": "specific theme",
      "actions": ["specific action 1", "specific action 2", "specific action 3"],
      "specificTasks": ["Step 1: Do X", "Step 2: Complete Y", "Step 3: Deliver Z"],
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    },
    "phase2": { 
      "label": "Phase 2", 
      "theme": "specific theme",
      "actions": ["specific action 1", "specific action 2", "specific action 3"],
      "specificTasks": ["Step 1: Do X", "Step 2: Complete Y", "Step 3: Deliver Z"],
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    },
    "phase3": { 
      "label": "Phase 3", 
      "theme": "specific theme",
      "actions": ["specific action 1", "specific action 2", "specific action 3"],
      "specificTasks": ["Step 1: Do X", "Step 2: Complete Y", "Step 3: Deliver Z"],
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  },
  "upskillingProjects": [
    {
      "title": "Project name",
      "description": "What to build/contribute to",
      "timeline": "X weeks",
      "skills": ["skill1", "skill2"],
      "outcome": "What they'll demonstrate"
    }
  ],
  "postingStrategy": {
    "frequency": "X times per week",
    "contentTypes": ["type1", "type2"],
    "platforms": ["LinkedIn", "Twitter", etc],
    "topics": ["topic1", "topic2"],
    "nextPosts": ["Post idea 1", "Post idea 2", "Post idea 3"]
  },
  "promotionNarrative": "First person. Specific. Evidence-based. The progression story they tell in ${data.timeline}. This should align with their progression intent (${intentLabels[data.progressionIntent || "same_company"]}). For 'same_company', focus on internal promotion narrative. For 'new_company', focus on external move narrative. For 'founder', focus on entrepreneurial journey. For 'pivot', focus on transition narrative."
}
`;
};