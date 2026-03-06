/**
 * Pre-LLM quality assessment. Pure logic over AnalyseRepoResult — no LLM, no API calls.
 */

import type { AnalyseRepoResult } from "../index";
import type {
  RepoQualityAssessment,
  QualitySignal,
  RepoQuality,
  LessonMode,
} from "./types";

const EXCLUDED_ROLES = new Set(["UNKNOWN", "DOCUMENTATION", "CONFIG"]);
const NOTEBOOK_REPO_TYPES = new Set(["SINGLE_NOTEBOOK", "NOTEBOOK_WITH_SCRIPTS"]);

const W_STRUCTURAL = 30;
const W_DEPENDENCY = 25;
const W_DOCS = 20;
const W_COMPLEXITY = 25;

export class RepoQualityError extends Error {
  constructor(
    message: string,
    public readonly assessment: RepoQualityAssessment
  ) {
    super(message);
    this.name = "RepoQualityError";
  }
}

function signal1Structural(analysis: AnalyseRepoResult): QualitySignal {
  const { fileMap, meta } = analysis;
  const meaningful = fileMap.classified.filter(
    (f) => f.type === "blob" && !EXCLUDED_ROLES.has(f.role)
  );
  const totalMeaningful = meaningful.length;
  const distinctRoles = new Set(meaningful.map((f) => f.role)).size;
  const roleDiversityRatio =
    totalMeaningful > 0
      ? Math.min(1, distinctRoles / totalMeaningful)
      : 0;
  const hasMultipleFiles = meaningful.filter(
    (f) => f.role !== "UNKNOWN" && f.role !== "CONFIG"
  ).length > 1;
  const isNotebookRepo = NOTEBOOK_REPO_TYPES.has(meta.repoType);

  const passes =
    isNotebookRepo ||
    (distinctRoles >= 2 && (totalMeaningful >= 3 || hasMultipleFiles));

  let detail: string;
  if (isNotebookRepo) {
    detail = "Notebook repo — structural separation assessed at cell level";
  } else if (passes) {
    detail = `${distinctRoles} distinct file roles across ${totalMeaningful} files — clear separation of concerns`;
  } else {
    detail =
      totalMeaningful <= 1
        ? "All files share the same role — no structural separation detected"
        : "Insufficient role diversity or file count for structural separation";
  }

  return {
    name: "Structural Separation",
    passed: passes,
    weight: W_STRUCTURAL,
    detail,
  };
}

function signal2Dependency(analysis: AnalyseRepoResult): QualitySignal {
  const { dependencyGraph, complexity, notebookAnalysis, meta } = analysis;
  const nodes = dependencyGraph.nodes;
  const nodeCount = nodes.length;
  const edgeCount = dependencyGraph.edges.length;
  const maxDepth = complexity.maxDepth;
  const criticalNodes = complexity.criticalNodes;
  const complexityScore = complexity.complexityScore;
  const isNotebookRepo = NOTEBOOK_REPO_TYPES.has(meta.repoType);

  let passed: boolean;
  let detail: string;

  if (isNotebookRepo && notebookAnalysis && notebookAnalysis.length > 0) {
    const hasCellEdges = notebookAnalysis.some(
      (nb) => nb.dependencyGraph.edges.length > 0
    );
    passed = complexityScore > 2;
    detail = passed
      ? `Notebook with complexity score ${complexityScore} — sufficient cell-level structure`
      : "Notebook with low complexity score — insufficient cell-level structure";
  } else if (nodeCount > 0) {
    passed =
      (maxDepth > 1 && nodeCount > 2) ||
      criticalNodes.length > 0;
    detail = passed
      ? `Dependency depth of ${maxDepth} with ${criticalNodes.length} central files — architectural structure present`
      : "No dependency relationships detected — files appear independent";
  } else {
    passed = false;
    detail = "No dependency relationships detected — files appear independent";
  }

  return {
    name: "Dependency Signal",
    passed,
    weight: W_DEPENDENCY,
    detail,
  };
}

function signal3Documentation(analysis: AnalyseRepoResult): QualitySignal {
  const { docs, notebookAnalysis, fileMap } = analysis;
  const totalDocChars = docs.reduce((s, d) => s + (d.content?.length ?? 0), 0);
  const hasDocs = docs.length > 0 && totalDocChars > 200;
  const narrativeLen =
    notebookAnalysis?.[0]?.narrative?.length ?? 0;
  const hasNarrative = narrativeLen > 100;
  const hasDocRole = fileMap.classified.some((f) => f.role === "DOCUMENTATION");

  const passed = hasDocs || hasNarrative || hasDocRole;

  let detail: string;
  if (hasDocs) {
    detail = `README present with ${totalDocChars} characters — sufficient context for lesson framing`;
  } else if (hasNarrative) {
    detail = `Notebook narrative of ${narrativeLen} characters — author reasoning available`;
  } else if (hasDocRole) {
    detail = "Documentation role files present — some context for lesson framing";
  } else {
    detail =
      "No documentation found — lessons cannot explain design intent";
  }

  return {
    name: "Documentation Signal",
    passed,
    weight: W_DOCS,
    detail,
  };
}

function signal4TeachableComplexity(analysis: AnalyseRepoResult): QualitySignal {
  const { complexity, patterns } = analysis;
  const score = complexity.complexityScore;
  const estimated = complexity.estimatedLessons;
  const patternCount = patterns.length;
  const criticalCount = complexity.criticalNodes.length;

  const passed =
    score >= 2 &&
    estimated >= 2 &&
    (patternCount > 0 || criticalCount > 0);

  let detail: string;
  if (passed) {
    detail =
      patternCount > 0 || criticalCount > 0
        ? `Complexity score ${score}, ${estimated} estimated lessons, ${patternCount} patterns detected — rich teaching material`
        : `Complexity score ${score}, ${estimated} estimated lessons — minimal but teachable`;
  } else {
    detail = `Complexity score ${score}, ${estimated} estimated lesson(s), ${patternCount} patterns — insufficient teaching material`;
  }

  return {
    name: "Teachable Complexity",
    passed,
    weight: W_COMPLEXITY,
    detail,
  };
}

function pickRejectionReason(analysis: AnalyseRepoResult): string {
  const { fileMap, dependencyGraph, complexity, patterns } = analysis;
  const meaningful = fileMap.classified.filter(
    (f) => f.type === "blob" && !EXCLUDED_ROLES.has(f.role)
  );
  const hasNoStructure =
    meaningful.length <= 1 &&
    dependencyGraph.nodes.length <= 1 &&
    complexity.maxDepth === 0;
  if (hasNoStructure)
    return "Repository contains no analysable code structure";
  if (
    complexity.complexityScore <= 1 &&
    complexity.estimatedLessons < 2 &&
    patterns.length === 0
  )
    return "Insufficient complexity to generate meaningful lessons (single file, no dependencies, no documentation)";
  const onlyConfig = meaningful.every((f) => f.role === "CONFIG" || f.role === "INFRASTRUCTURE");
  if (onlyConfig || meaningful.length === 0)
    return "Repository appears to be configuration or infrastructure only — no application logic to teach";
  return "Repository is not suitable for lesson generation";
}

export function assessRepoQuality(
  analysis: AnalyseRepoResult
): RepoQualityAssessment {
  const s1 = signal1Structural(analysis);
  const s2 = signal2Dependency(analysis);
  const s3 = signal3Documentation(analysis);
  const s4 = signal4TeachableComplexity(analysis);
  const signals = [s1, s2, s3, s4];
  const score = signals
    .filter((s) => s.passed)
    .reduce((sum, s) => sum + s.weight, 0);

  let quality: RepoQuality;
  let lessonMode: LessonMode;
  let rejectionReason: string | undefined;

  if (score >= 75) {
    quality = "GOOD";
    lessonMode = "EXPLANATORY";
  } else if (score >= 45) {
    quality = "TEACHABLE";
    lessonMode = "EXPLANATORY";
  } else if (score >= 20) {
    quality = "POOR";
    lessonMode = "CRITIQUE";
  } else {
    quality = "UNTEACHABLE";
    lessonMode = "CRITIQUE";
    rejectionReason = pickRejectionReason(analysis);
  }

  return {
    quality,
    lessonMode,
    score,
    signals,
    rejectionReason,
  };
}
