/**
 * Tests for repoQualityGate. Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' repoQualityGate.test.ts
 */

import type { AnalyseRepoResult } from "../index";
import { assessRepoQuality, RepoQualityError } from "./repoQualityGate";
import { generateLessonPlan } from "./index";

function buildMock(overrides: Partial<AnalyseRepoResult>): AnalyseRepoResult {
  const base: AnalyseRepoResult = {
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
  };
  return { ...base, ...overrides } as AnalyseRepoResult;
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function runTests(): Promise<void> {
  // Test 1 — GOOD repo
  const good = buildMock({
    fileMap: {
      total: 12,
      classified: [
        { path: "a.py", type: "blob", role: "ENTRY_POINT" },
        { path: "b.py", type: "blob", role: "MODEL" },
        { path: "c.py", type: "blob", role: "BUSINESS_LOGIC" },
        { path: "d.py", type: "blob", role: "TEST" },
        { path: "e.py", type: "blob", role: "UTILITY" },
        { path: "f.py", type: "blob", role: "ENTRY_POINT" },
        { path: "g.py", type: "blob", role: "MODEL" },
        { path: "h.py", type: "blob", role: "BUSINESS_LOGIC" },
        { path: "i.py", type: "blob", role: "TEST" },
        { path: "j.py", type: "blob", role: "UTILITY" },
        { path: "k.py", type: "blob", role: "DATA_LAYER" },
        { path: "l.py", type: "blob", role: "CONFIG" },
      ] as any,
    },
    dependencyGraph: {
      nodes: [
        { id: "a.py", role: "ENTRY_POINT", definitions: [], inDegree: 0, outDegree: 2, centrality: false },
        { id: "b.py", role: "MODEL", definitions: [], inDegree: 2, outDegree: 0, centrality: true },
        { id: "c.py", role: "BUSINESS_LOGIC", definitions: [], inDegree: 1, outDegree: 1, centrality: true },
        { id: "d.py", role: "TEST", definitions: [], inDegree: 0, outDegree: 1, centrality: false },
      ] as any,
      edges: [
        { from: "a.py", to: "b.py", type: "IMPORTS" },
        { from: "a.py", to: "c.py", type: "IMPORTS" },
        { from: "c.py", to: "b.py", type: "IMPORTS" },
        { from: "d.py", to: "b.py", type: "IMPORTS" },
      ],
    },
    patterns: [
      { pattern: "MVC", confidence: 0.7 },
      { pattern: "SERVICE_LAYER", confidence: 0.6 },
      { pattern: "REST_API", confidence: 0.5 },
    ],
    complexity: {
      fileCount: 12,
      maxDepth: 4,
      avgDependencies: 1,
      criticalNodes: ["b.py", "c.py"],
      complexityScore: 8,
      estimatedLessons: 12,
    },
    docs: [{ path: "README.md", content: "x".repeat(500) }],
  });
  const goodAssessment = assessRepoQuality(good);
  assert(goodAssessment.quality === "GOOD", "Test 1: expected quality GOOD");
  assert(goodAssessment.score >= 75, "Test 1: expected score >= 75");
  assert(goodAssessment.lessonMode === "EXPLANATORY", "Test 1: expected EXPLANATORY");
  assert(
    goodAssessment.signals.every((s) => s.passed),
    "Test 1: expected all 4 signals to pass"
  );

  // Test 2 — TEACHABLE repo (score 45–74: e.g. structural fails, others pass → 70)
  const teachable = buildMock({
    fileMap: {
      total: 4,
      classified: [
        { path: "a.py", type: "blob", role: "ENTRY_POINT" },
        { path: "b.py", type: "blob", role: "ENTRY_POINT" },
        { path: "c.py", type: "blob", role: "ENTRY_POINT" },
        { path: "d.py", type: "blob", role: "ENTRY_POINT" },
      ] as any,
    },
    dependencyGraph: {
      nodes: [
        { id: "a.py", role: "ENTRY_POINT", definitions: [], inDegree: 0, outDegree: 1, centrality: false },
        { id: "b.py", role: "ENTRY_POINT", definitions: [], inDegree: 1, outDegree: 0, centrality: false },
        { id: "c.py", role: "ENTRY_POINT", definitions: [], inDegree: 0, outDegree: 1, centrality: false },
      ] as any,
      edges: [
        { from: "a.py", to: "b.py", type: "IMPORTS" },
        { from: "c.py", to: "b.py", type: "IMPORTS" },
      ],
    },
    patterns: [{ pattern: "TRAINING_PIPELINE", confidence: 0.5 }],
    complexity: {
      fileCount: 4,
      maxDepth: 2,
      avgDependencies: 0.5,
      criticalNodes: [],
      complexityScore: 4,
      estimatedLessons: 6,
    },
    docs: [{ path: "README.md", content: "y".repeat(300) }],
  });
  const teachableAssessment = assessRepoQuality(teachable);
  assert(teachableAssessment.quality === "TEACHABLE", "Test 2: expected TEACHABLE");
  assert(teachableAssessment.score >= 45, "Test 2: expected score >= 45");
  assert(teachableAssessment.lessonMode === "EXPLANATORY", "Test 2: expected EXPLANATORY");

  // Test 3 — POOR repo (score 20–44: one signal passes → 20)
  const poor = buildMock({
    fileMap: {
      total: 3,
      classified: [
        { path: "a.py", type: "blob", role: "BUSINESS_LOGIC" },
        { path: "b.py", type: "blob", role: "BUSINESS_LOGIC" },
        { path: "c.py", type: "blob", role: "BUSINESS_LOGIC" },
      ] as any,
    },
    dependencyGraph: {
      nodes: [
        { id: "a.py", role: "BUSINESS_LOGIC", definitions: [], inDegree: 0, outDegree: 1, centrality: false },
        { id: "b.py", role: "BUSINESS_LOGIC", definitions: [], inDegree: 1, outDegree: 0, centrality: false },
      ] as any,
      edges: [{ from: "a.py", to: "b.py", type: "IMPORTS" }],
    },
    patterns: [],
    complexity: {
      fileCount: 3,
      maxDepth: 1,
      avgDependencies: 0.5,
      criticalNodes: [],
      complexityScore: 2,
      estimatedLessons: 3,
    },
    docs: [{ path: "README.md", content: "z".repeat(201) }],
  });
  const poorAssessment = assessRepoQuality(poor);
  assert(poorAssessment.quality === "POOR", "Test 3: expected POOR");
  assert(poorAssessment.lessonMode === "CRITIQUE", "Test 3: expected CRITIQUE");
  const failedCount = poorAssessment.signals.filter((s) => !s.passed).length;
  assert(failedCount >= 2, "Test 3: expected at least 2 signals to fail");

  // Test 4 — UNTEACHABLE repo
  const unteachable = buildMock({
    fileMap: {
      total: 1,
      classified: [{ path: "only.py", type: "blob", role: "BUSINESS_LOGIC" }] as any,
    },
    dependencyGraph: { nodes: [], edges: [] },
    patterns: [],
    complexity: {
      fileCount: 1,
      maxDepth: 0,
      avgDependencies: 0,
      criticalNodes: [],
      complexityScore: 1,
      estimatedLessons: 1,
    },
    docs: [],
  });
  const unteachableAssessment = assessRepoQuality(unteachable);
  assert(unteachableAssessment.quality === "UNTEACHABLE", "Test 4: expected UNTEACHABLE");
  assert(
    unteachableAssessment.rejectionReason != null && unteachableAssessment.rejectionReason.length > 0,
    "Test 4: expected rejectionReason set and non-empty"
  );
  assert(unteachableAssessment.score < 20, "Test 4: expected score < 20");

  // Test 5 — Notebook repo gets structural pass
  const notebookRepo = buildMock({
    meta: { ...buildMock({}).meta, repoType: "SINGLE_NOTEBOOK" },
    fileMap: {
      total: 1,
      classified: [{ path: "only.ipynb", type: "blob", role: "NOTEBOOK" }] as any,
    },
    dependencyGraph: { nodes: [], edges: [] },
    notebookAnalysis: [
      {
        dependencyGraph: { nodes: [], edges: [] },
        narrative: "n".repeat(500),
        cells: [],
      },
    ],
    patterns: [{ pattern: "NOTEBOOK_NARRATIVE", confidence: 0.9 }],
    complexity: {
      fileCount: 1,
      maxDepth: 0,
      avgDependencies: 0,
      criticalNodes: [],
      complexityScore: 5,
      estimatedLessons: 8,
    },
    docs: [],
  });
  const notebookAssessment = assessRepoQuality(notebookRepo);
  const structuralSignal = notebookAssessment.signals.find(
    (s) => s.name === "Structural Separation"
  );
  assert(structuralSignal != null && structuralSignal.passed, "Test 5: Signal 1 (structural) should pass");
  assert(
    notebookAssessment.quality === "TEACHABLE" || notebookAssessment.quality === "GOOD",
    "Test 5: quality should be at least TEACHABLE"
  );

  // Test 6 — RepoQualityError thrown from generateLessonPlan
  let threw = false;
  try {
    await generateLessonPlan(unteachable, "ML_ENGINEER");
  } catch (e) {
    threw = true;
    assert(e instanceof RepoQualityError, "Test 6: expected RepoQualityError");
    assert(
      (e as RepoQualityError).assessment.quality === "UNTEACHABLE",
      "Test 6: assessment.quality should be UNTEACHABLE"
    );
  }
  assert(threw, "Test 6: generateLessonPlan should throw for UNTEACHABLE");

  console.log("repoQualityGate.test.ts: all assertions passed.");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
