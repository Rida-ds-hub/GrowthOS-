export const buildGapAnalysisPrompt = (data: {
  currentRole: string;
  targetRole: string;
  yearsExperience: number;
  timeline: string;
  githubData?: string;
  resumeText?: string;
  linkedinText?: string;
}) => `
You are a senior engineering career strategist. You think in structured frameworks. No motivational language. No filler. Precision only.

PROFILE:
- Current Role: ${data.currentRole}
- Target Role: ${data.targetRole}
- Years of Experience: ${data.yearsExperience}
- Timeline: ${data.timeline}

GitHub Data:
${data.githubData || "Not provided"}

Resume:
${data.resumeText || "Not provided"}

LinkedIn / Background:
${data.linkedinText || "Not provided"}

Analyse across 5 domains: System Design Maturity, Execution Scope, Communication & Visibility, Technical Depth, Leadership & Influence.

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
  "gaps": [
    {
      "domain": "string",
      "gap": "high|medium|low",
      "observation": "what the evidence shows",
      "requirement": "what the target role needs",
      "closingAction": "single most effective action"
    }
  ],
  "plan": {
    "phase1": { "label": "Days 1-30", "theme": "string", "actions": ["string", "string", "string"] },
    "phase2": { "label": "Days 31-60", "theme": "string", "actions": ["string", "string", "string"] },
    "phase3": { "label": "Days 61-90", "theme": "string", "actions": ["string", "string", "string"] }
  },
  "promotionNarrative": "First person. Specific. Evidence-based. The story they tell in ${data.timeline}."
}
`;
