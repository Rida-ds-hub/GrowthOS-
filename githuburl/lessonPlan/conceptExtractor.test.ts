/**
 * Tests for conceptExtractor. Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' conceptExtractor.test.ts
 */

import type { AnalyseRepoResult } from "../index";
import { extractConcepts } from "./conceptExtractor";

function buildMockAnalysis(overrides: Partial<AnalyseRepoResult>): AnalyseRepoResult {
  return {
    meta: {
      repoName: "test/repo",
      repoUrl: "https://github.com/test/repo",
      description: null,
      primaryLanguage: "Python",
      repoType: "PYTHON_PROJECT",
      frameworks: [],
      entryPoints: [],
    },
    fileMap: { total: 0, classified: [] },
    dependencyGraph: { nodes: [], edges: [] },
    notebookAnalysis: null,
    patterns: [],
    complexity: {
      fileCount: 0,
      maxDepth: 0,
      avgDependencies: 0,
      criticalNodes: [],
      complexityScore: 1,
      estimatedLessons: 2,
    },
    rawFileTree: [],
    docs: [],
    ...overrides,
  };
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function runTests(): Promise<void> {
  // 1. Notebook-only: should have DATA_FLOW from notebook narrative
  const notebookOnly = buildMockAnalysis({
    meta: { ...buildMockAnalysis({}).meta, repoType: "SINGLE_NOTEBOOK" },
    notebookAnalysis: [
      {
        dependencyGraph: { nodes: [], edges: [] },
        narrative: "This notebook loads data and trains a model.",
        cells: [],
      },
    ],
    patterns: [{ pattern: "NOTEBOOK_NARRATIVE", confidence: 0.9 }],
    complexity: { ...buildMockAnalysis({}).complexity, fileCount: 2 },
  });
  const conceptsNotebook = extractConcepts(notebookOnly);
  const dataFlowConcepts = conceptsNotebook.filter((c) => c.conceptType === "DATA_FLOW");
  assert(dataFlowConcepts.length >= 1, "Notebook-only: expected at least one DATA_FLOW concept");
  const patternConcepts = conceptsNotebook.filter((c) => c.conceptType === "ARCHITECTURAL_PATTERN");
  assert(patternConcepts.length >= 1, "Notebook-only: expected NOTEBOOK_NARRATIVE pattern as ARCHITECTURAL_PATTERN");

  // 2. Multi-file Python: patterns + critical nodes → DESIGN_DECISION, ARCHITECTURAL_PATTERN
  const pythonProject = buildMockAnalysis({
    meta: { ...buildMockAnalysis({}).meta, repoType: "PYTHON_PROJECT" },
    fileMap: {
      total: 10,
      classified: [
        { path: "src/model.py", type: "blob", role: "MODEL" },
        { path: "src/train.py", type: "blob", role: "TRAINING_PIPELINE" },
        { path: "tests/test_model.py", type: "blob", role: "TEST" },
        { path: "tests/test_train.py", type: "blob", role: "TEST" },
        { path: "config.py", type: "blob", role: "CONFIG" },
      ] as any,
    },
    dependencyGraph: {
      nodes: [
        { id: "src/model.py", role: "MODEL", definitions: [], inDegree: 2, outDegree: 0, centrality: true },
        { id: "src/train.py", role: "TRAINING_PIPELINE", definitions: [], inDegree: 0, outDegree: 1, centrality: false },
      ] as any,
      edges: [{ from: "src/train.py", to: "src/model.py", type: "IMPORTS" }],
    },
    patterns: [
      { pattern: "TRAINING_PIPELINE", confidence: 0.85 },
      { pattern: "MVC", confidence: 0.4 },
    ],
    complexity: {
      fileCount: 5,
      maxDepth: 2,
      avgDependencies: 0.5,
      criticalNodes: ["src/model.py"],
      complexityScore: 3,
      estimatedLessons: 5,
    },
  });
  const conceptsPython = extractConcepts(pythonProject);
  const designDecisions = conceptsPython.filter((c) => c.conceptType === "DESIGN_DECISION");
  assert(designDecisions.length >= 1, "Python project: expected at least one DESIGN_DECISION (critical node)");
  const archPatterns = conceptsPython.filter((c) => c.conceptType === "ARCHITECTURAL_PATTERN");
  assert(archPatterns.length >= 1, "Python project: expected TRAINING_PIPELINE as ARCHITECTURAL_PATTERN");
  const testabilityConcept = conceptsPython.filter(
    (c) => c.conceptType === "DESIGN_DECISION" && c.source === "FILE_ROLE_DISTRIBUTION"
  );
  assert(testabilityConcept.length >= 1, "Python project: >30% tests should yield testability DESIGN_DECISION");

  // 3. JS project: no notebook, different patterns
  const jsProject = buildMockAnalysis({
    meta: { ...buildMockAnalysis({}).meta, repoType: "JAVASCRIPT_PROJECT", primaryLanguage: "TypeScript" },
    fileMap: {
      total: 8,
      classified: [
        { path: "src/index.ts", type: "blob", role: "ENTRY_POINT" },
        { path: "src/api.ts", type: "blob", role: "BUSINESS_LOGIC" },
        { path: "config/env.ts", type: "blob", role: "CONFIG" },
        { path: "config/db.ts", type: "blob", role: "CONFIG" },
        { path: "config/redis.ts", type: "blob", role: "CONFIG" },
      ] as any,
    },
    dependencyGraph: {
      nodes: [
        { id: "src/index.ts", role: "ENTRY_POINT", definitions: [], inDegree: 0, outDegree: 2, centrality: false },
        { id: "src/api.ts", role: "BUSINESS_LOGIC", definitions: [], inDegree: 1, outDegree: 0, centrality: true },
      ] as any,
      edges: [{ from: "src/index.ts", to: "src/api.ts", type: "IMPORTS" }],
    },
    patterns: [{ pattern: "REST_API", confidence: 0.6 }],
    complexity: {
      fileCount: 5,
      maxDepth: 1,
      avgDependencies: 1,
      criticalNodes: ["src/api.ts"],
      complexityScore: 2,
      estimatedLessons: 3,
    },
  });
  const conceptsJs = extractConcepts(jsProject);
  assert(
    conceptsJs.some((c) => c.conceptType === "ARCHITECTURAL_PATTERN"),
    "JS project: expected REST_API as ARCHITECTURAL_PATTERN"
  );
  assert(
    conceptsJs.some((c) => c.conceptType === "DESIGN_DECISION" && c.fileAnchors.includes("src/api.ts")),
    "JS project: expected DESIGN_DECISION for critical node src/api.ts"
  );
  const orchestrationConcept = conceptsJs.filter((c) => c.conceptType === "ORCHESTRATION");
  assert(
    orchestrationConcept.length >= 1,
    "JS project: config-heavy should yield ORCHESTRATION concept"
  );

  console.log("conceptExtractor.test.ts: all assertions passed.");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
