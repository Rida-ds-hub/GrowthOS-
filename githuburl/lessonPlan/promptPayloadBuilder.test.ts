/**
 * Tests for promptPayloadBuilder. Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' promptPayloadBuilder.test.ts
 */

import type { AnalyseRepoResult } from "../index";
import type { OrderedConcept } from "./types";
import { buildPromptPayload } from "./promptPayloadBuilder";

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

function makeOrderedConcept(
  id: string,
  dayNumber: number,
  fileAnchors: string[] = ["a.py"]
): OrderedConcept {
  return {
    id,
    title: `Concept ${id}`,
    source: "PATTERN",
    signal: "signal",
    relevanceScore: 0.8,
    roleRelevance: {},
    fileAnchors,
    conceptType: "ARCHITECTURAL_PATTERN",
    dayNumber,
    estimatedMinutes: 15,
  };
}

function runTests(): void {
  // Test 1 — Standard Python repo
  const standardRepo = buildMock({
    patterns: [
      { pattern: "P1", confidence: 0.5 },
      { pattern: "P2", confidence: 0.9 },
      { pattern: "P3", confidence: 0.7 },
      { pattern: "P4", confidence: 0.6 },
      { pattern: "P5", confidence: 0.8 },
      { pattern: "P6", confidence: 0.4 },
      { pattern: "P7", confidence: 0.3 },
      { pattern: "P8", confidence: 0.2 },
    ],
    dependencyGraph: {
      nodes: [
        { id: "a.py", role: "ENTRY_POINT", definitions: [], inDegree: 0, outDegree: 2, centrality: false },
        { id: "b.py", role: "MODEL", definitions: [], inDegree: 5, outDegree: 0, centrality: true },
        { id: "c.py", role: "BUSINESS_LOGIC", definitions: [], inDegree: 4, outDegree: 1, centrality: true },
        { id: "d.py", role: "MODEL", definitions: [], inDegree: 3, outDegree: 0, centrality: true },
        { id: "e.py", role: "UTILITY", definitions: [], inDegree: 2, outDegree: 0, centrality: true },
        { id: "f.py", role: "UTILITY", definitions: [], inDegree: 1, outDegree: 0, centrality: true },
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `x${i}.py`,
          role: "UTILITY",
          definitions: [] as string[],
          inDegree: 0,
          outDegree: 0,
          centrality: false,
        })),
      ] as any,
      edges: [],
    },
    docs: [
      { path: "README.md", content: "Hello README content here." },
      { path: "ARCHITECTURE.md", content: "Architecture overview." },
      ...Array.from({ length: 8 }, (_, i) => ({
        path: `doc${i}.md`,
        content: `Random doc ${i} content.`,
      })),
    ],
  });
  const orderedConcepts1 = [
    makeOrderedConcept("c1", 1),
    makeOrderedConcept("c2", 2),
  ];
  const payload1 = buildPromptPayload(standardRepo, orderedConcepts1);

  assert(payload1.topPatterns.length <= 5, "Test 1: topPatterns.length <= 5");
  for (let i = 1; i < payload1.topPatterns.length; i++) {
    assert(
      payload1.topPatterns[i].confidence <= payload1.topPatterns[i - 1].confidence,
      "Test 1: topPatterns sorted by confidence descending"
    );
  }
  assert(payload1.topCriticalNodes.length <= 5, "Test 1: topCriticalNodes.length <= 5");
  for (let i = 1; i < payload1.topCriticalNodes.length; i++) {
    assert(
      payload1.topCriticalNodes[i].inDegree <= payload1.topCriticalNodes[i - 1].inDegree,
      "Test 1: topCriticalNodes sorted by inDegree descending"
    );
  }
  assert(payload1.docSummary.length <= 2500, "Test 1: docSummary.length <= 2500");
  assert(
    payload1.docSummary.includes("README") || payload1.docSummary.includes("Hello README"),
    "Test 1: docSummary contains content from README"
  );
  assert(
    !/<[^>]+>/.test(payload1.docSummary),
    "Test 1: docSummary does not contain raw HTML tags"
  );
  console.log("Test 1 — Standard Python repo: PASS");

  // Test 2 — Notebook repo
  const notebookRepo = buildMock({
    meta: {
      repoName: "nb/repo",
      repoUrl: "https://github.com/nb/repo",
      description: null,
      primaryLanguage: "Python",
      repoType: "SINGLE_NOTEBOOK",
      frameworks: [],
      entryPoints: [],
    },
    dependencyGraph: { nodes: [], edges: [] },
    notebookAnalysis: [
      {
        dependencyGraph: {
          nodes: [
            { id: "cell_0", role: "IMPORTS", definitions: [], inDegree: 0, outDegree: 1, centrality: false },
            { id: "cell_1", role: "MODEL_DEFINITION", definitions: [], inDegree: 2, outDegree: 0, centrality: true },
            { id: "cell_2", role: "TRAINING", definitions: [], inDegree: 1, outDegree: 0, centrality: true },
          ] as any,
          edges: [],
        },
        narrative: "",
        cells: [],
      },
    ],
    docs: [{ path: "README.md", content: "Notebook repo README. ".repeat(25) }],
  });
  const orderedConcepts2 = [
    makeOrderedConcept("n1", 1),
    makeOrderedConcept("n2", 2),
  ];
  const payload2 = buildPromptPayload(notebookRepo, orderedConcepts2);

  assert(
    payload2.topCriticalNodes.some((n) => n.path === "cell_1" || n.path === "cell_2"),
    "Test 2: topCriticalNodes derived from notebook analysis"
  );
  assert(
    payload2.docSummary.includes("README") || payload2.docSummary.includes("Notebook repo"),
    "Test 2: docSummary contains README content"
  );
  assert(
    payload2.conceptsPayload[0].id === "n1" && payload2.conceptsPayload[1].id === "n2",
    "Test 2: conceptsPayload preserves order of input orderedConcepts"
  );
  console.log("Test 2 — Notebook repo: PASS");

  // Test 3 — Sparse repo
  const sparseRepo = buildMock({
    docs: [],
    patterns: [],
    dependencyGraph: {
      nodes: [
        { id: "a.py", role: "UTILITY", definitions: [], inDegree: 0, outDegree: 0, centrality: false },
      ] as any,
      edges: [],
    },
  });
  const payload3 = buildPromptPayload(sparseRepo, []);

  assert(payload3.topPatterns.length === 0, "Test 3: topPatterns is []");
  assert(payload3.topCriticalNodes.length === 0, "Test 3: topCriticalNodes is []");
  assert(payload3.docSummary === "", "Test 3: docSummary is ''");
  assert(payload3.repoMeta.repoName === "test/repo", "Test 3: valid PromptPayload returned");
  console.log("Test 3 — Sparse repo: PASS");

  // Test 4 — Doc selection priority
  const priorityDocsRepo = buildMock({
    docs: [
      { path: "src/utils.md", content: "Utils content." },
      { path: "ARCHITECTURE.md", content: "Architecture content." },
      { path: "docs/setup.md", content: "Setup content." },
      { path: "README.md", content: "Readme content." },
      { path: "contributing/guide.md", content: "Contributing content." },
      { path: "random.md", content: "Random content." },
    ],
  });
  const payload4 = buildPromptPayload(priorityDocsRepo, []);

  const readmeIdx = payload4.docSummary.indexOf("Readme content") >= 0
    ? payload4.docSummary.indexOf("Readme content")
    : payload4.docSummary.indexOf("[README.md]");
  const archIdx = payload4.docSummary.indexOf("Architecture content") >= 0
    ? payload4.docSummary.indexOf("Architecture content")
    : payload4.docSummary.indexOf("[ARCHITECTURE.md]");
  const setupIdx = payload4.docSummary.indexOf("Setup content") >= 0
    ? payload4.docSummary.indexOf("Setup content")
    : payload4.docSummary.indexOf("[docs/setup.md]");

  assert(readmeIdx >= 0, "Test 4: docSummary contains content from README");
  assert(archIdx >= 0, "Test 4: docSummary contains content from ARCHITECTURE");
  assert(setupIdx >= 0, "Test 4: docSummary contains content from docs/setup");
  assert(
    payload4.docSummary.indexOf("[README.md]") < payload4.docSummary.indexOf("[ARCHITECTURE.md]") ||
    payload4.docSummary.indexOf("Readme") < payload4.docSummary.indexOf("Architecture"),
    "Test 4: README appears before or with ARCHITECTURE"
  );
  console.log("Test 4 — Doc selection priority: PASS");

  // Test 5 — Hard cap enforcement (3 docs × 800 chars + long path/separators exceed 2500)
  const longContent = "x".repeat(2000);
  const longPath = "very/long/path/to/documentation/file.md";
  const hardCapRepo = buildMock({
    docs: [
      { path: longPath + "a", content: longContent },
      { path: longPath + "b", content: longContent },
      { path: longPath + "c", content: longContent },
    ],
  });
  const payload5 = buildPromptPayload(hardCapRepo, []);

  assert(payload5.docSummary.length <= 2500 + 20, "Test 5: docSummary length capped");
  assert(
    payload5.docSummary.endsWith("[...truncated]"),
    "Test 5: docSummary ends with [...truncated] when over limit"
  );
  console.log("Test 5 — Hard cap enforcement: PASS");

  // Test 6 — conceptsPayload shape
  const eightConcepts: OrderedConcept[] = Array.from({ length: 8 }, (_, i) =>
    makeOrderedConcept(`concept-${i}`, i + 1, ["f1.py", "f2.py", "f3.py", "f4.py", "f5.py"])
  );
  const payload6 = buildPromptPayload(buildMock({}), eightConcepts);

  assert(payload6.conceptsPayload.length === 8, "Test 6: conceptsPayload.length === 8");
  for (const c of payload6.conceptsPayload) {
    assert(c.fileAnchors.length <= 3, "Test 6: each concept fileAnchors.length <= 3");
  }
  for (let i = 0; i < 8; i++) {
    assert(
      payload6.conceptsPayload[i].id === eightConcepts[i].id,
      "Test 6: order matches input"
    );
  }
  console.log("Test 6 — conceptsPayload shape: PASS");

  console.log("\nAll 6 tests passed.");
}

runTests();
