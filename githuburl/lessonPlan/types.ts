/**
 * Types for the Lesson Plan Generator sub-module.
 * No logic, no imports from analysis or other modules.
 */

export type TargetRole =
  | "SOFTWARE_ENGINEER"
  | "ML_ENGINEER"
  | "DATA_SCIENTIST"
  | "DATA_ANALYST"
  | "DATA_ENGINEER"
  | "PRODUCT_MANAGER"
  | "DEVOPS_ENGINEER"
  | "FRONTEND_ENGINEER"
  | "BACKEND_ENGINEER"
  | "FULLSTACK_ENGINEER";

export type ConceptSource =
  | "PATTERN"
  | "CRITICAL_NODE"
  | "NOTEBOOK_NARRATIVE"
  | "DEPENDENCY_CHAIN"
  | "FILE_ROLE_DISTRIBUTION"
  | "COMPLEXITY";

export type ConceptType =
  | "ARCHITECTURAL_PATTERN"
  | "DESIGN_DECISION"
  | "TRADEOFF"
  | "DATA_FLOW"
  | "SYSTEM_BOUNDARY"
  | "ORCHESTRATION"
  | "IMPLEMENTATION_DETAIL";

export interface CandidateConcept {
  id: string;
  title: string;
  source: ConceptSource;
  signal: string;
  relevanceScore: number;
  roleRelevance: Partial<Record<TargetRole, number>>;
  fileAnchors: string[];
  conceptType: ConceptType;
}

/** How the learner responds to this question. */
export type ResponseFormat =
  | "FREE_TEXT"
  | "RANKED_CHOICE"
  | "MULTI_SELECT"
  | "SINGLE_SELECT";

/** Whether this question requires LLM evaluation or can be evaluated deterministically. */
export type EvaluationMethod = "LLM_REQUIRED" | "DETERMINISTIC" | "HYBRID";

export type QuestionType =
  | "DEFEND_DECISION"
  | "IDENTIFY_TRADEOFF"
  | "PROPOSE_ALTERNATIVE"
  | "DIAGNOSE_PROBLEM";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface EvaluationRubric {
  reasoningGuidance: string | null;
  correctOptionIds: string[] | null;
  correctRankOrder: string[] | null;
  keyLearning: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  type: QuestionType;
  responseFormat: ResponseFormat;
  evaluationMethod: EvaluationMethod;
  options: QuestionOption[] | null;
  rubric: EvaluationRubric;
}

export interface Lesson {
  dayNumber: number;
  title: string;
  coreQuestion: string;
  concept: string;
  conceptType: ConceptType;
  hook: string;
  context: string;
  coreInsight: string;
  tradeoff: string;
  roleRelevanceNote: string;
  fileAnchors: string[];
  testQuestions: TestQuestion[];
  codeRevealAfterTest: boolean;
  estimatedMinutes: number;
  designDecisionRef?: string;
}

/** Raw lesson stub returned by Gemini (Call 2) before assembly into Lesson. */
export interface LessonStubRaw {
  title: string;
  coreQuestion: string;
  hook: string;
  context: string;
  coreInsight: string;
  tradeoff: string;
  roleRelevanceNote: string;
  designDecisionRef: string | null;
  codeRevealAfterTest: boolean;
}

export interface DesignDecision {
  id: string;
  title: string;
  problem: string;
  solution: string;
  tradeoff: string;
  alternativesConsidered: string[];
}

export interface LessonPlan {
  repoName: string;
  repoUrl: string;
  targetRole: TargetRole;
  totalLessons: number;
  estimatedDays: number;
  designDecisions: DesignDecision[];
  lessons: Lesson[];
  generatedAt: string;
  qualityAssessment: RepoQualityAssessment;
}

/** CandidateConcept with dayNumber and estimatedMinutes (output of lessonOrdering). */
export interface OrderedConcept extends CandidateConcept {
  dayNumber: number;
  estimatedMinutes: number;
}

export type RepoQuality = "GOOD" | "TEACHABLE" | "POOR" | "UNTEACHABLE";

export type LessonMode = "EXPLANATORY" | "CRITIQUE";

export interface QualitySignal {
  name: string;
  passed: boolean;
  weight: number;
  detail: string;
}

export interface RepoQualityAssessment {
  quality: RepoQuality;
  lessonMode: LessonMode;
  score: number;
  signals: QualitySignal[];
  rejectionReason?: string;
}

// --- Prompt payload types (lean input for LLM prompts) ---

export interface PromptRepoMeta {
  repoName: string;
  repoType: string;
  primaryLanguage: string;
  frameworks: string[];
  entryPoints: string[];
  complexityScore: number;
  estimatedLessons: number;
}

export interface PromptPattern {
  pattern: string;
  confidence: number;
}

export interface PromptCriticalNode {
  path: string;
  inDegree: number;
  role: string;
}

export interface PromptConcept {
  id: string;
  title: string;
  conceptType: string;
  fileAnchors: string[];
  signal: string;
  dayNumber: number;
}

export interface PromptPayload {
  repoMeta: PromptRepoMeta;
  topPatterns: PromptPattern[];
  topCriticalNodes: PromptCriticalNode[];
  docSummary: string;
  conceptsPayload: PromptConcept[];
}
