/**
 * Lesson Plan Generator: public API and type re-exports.
 */

import type { AnalyseRepoResult } from "../index";
import { assessRepoQuality, RepoQualityError } from "./repoQualityGate";
import { extractConcepts } from "./conceptExtractor";
import { rankConceptsForRole } from "./roleMapper";
import { orderConceptsForTeaching } from "./lessonOrdering";
import { buildLessonsWithLLM } from "./llmLessonBuilder";
import type {
  LessonPlan,
  TargetRole,
  Lesson,
  DesignDecision,
  TestQuestion,
  CandidateConcept,
  OrderedConcept,
  ConceptSource,
  ConceptType,
  RepoQuality,
  LessonMode,
  RepoQualityAssessment,
  QualitySignal,
} from "./types";

export type {
  LessonPlan,
  TargetRole,
  Lesson,
  DesignDecision,
  TestQuestion,
  CandidateConcept,
  OrderedConcept,
  ConceptSource,
  ConceptType,
  RepoQuality,
  LessonMode,
  RepoQualityAssessment,
  QualitySignal,
};
export { RepoQualityError } from "./repoQualityGate";

export async function generateLessonPlan(
  analysis: AnalyseRepoResult,
  targetRole: TargetRole
): Promise<LessonPlan> {
  const qualityAssessment = assessRepoQuality(analysis);
  if (qualityAssessment.quality === "UNTEACHABLE") {
    throw new RepoQualityError(
      qualityAssessment.rejectionReason ?? "Repository is not suitable for lesson generation",
      qualityAssessment
    );
  }
  const concepts = extractConcepts(analysis);
  const ranked = rankConceptsForRole(concepts, targetRole);
  const ordered = orderConceptsForTeaching(
    ranked,
    analysis.meta.repoType,
    targetRole
  );
  const { designDecisions, lessons } = await buildLessonsWithLLM(
    analysis,
    targetRole,
    ordered
  );
  return {
    repoName: analysis.meta.repoName,
    repoUrl: analysis.meta.repoUrl,
    targetRole,
    totalLessons: lessons.length,
    estimatedDays: lessons.length,
    designDecisions,
    lessons,
    generatedAt: new Date().toISOString(),
    qualityAssessment,
  };
}
