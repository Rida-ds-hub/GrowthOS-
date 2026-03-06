/**
 * Tests for lessonOrdering. Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' lessonOrdering.test.ts
 */

import type { CandidateConcept, TargetRole } from "./types";
import { orderConceptsForTeaching } from "./lessonOrdering";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function makeConcept(id: string, conceptType: CandidateConcept["conceptType"]): CandidateConcept {
  return {
    id,
    title: id,
    source: "PATTERN",
    signal: "",
    relevanceScore: 0.8,
    roleRelevance: {},
    fileAnchors: [],
    conceptType,
  };
}

async function runTests(): Promise<void> {
  const ranked: CandidateConcept[] = [
    makeConcept("impl-1", "IMPLEMENTATION_DETAIL"),
    makeConcept("data-flow-1", "DATA_FLOW"),
    makeConcept("tradeoff-1", "TRADEOFF"),
    makeConcept("arch-1", "ARCHITECTURAL_PATTERN"),
  ];

  const ordered = orderConceptsForTeaching(ranked, "PYTHON_PROJECT", "SOFTWARE_ENGINEER");
  const last = ordered[ordered.length - 1];
  assert(last.conceptType === "IMPLEMENTATION_DETAIL", "IMPLEMENTATION_DETAIL should be last");

  for (let i = 0; i < ordered.length; i++) {
    assert(ordered[i].dayNumber === i + 1, `dayNumber should be 1-based sequential: ${ordered[i].dayNumber}`);
    assert(ordered[i].estimatedMinutes === 15, "estimatedMinutes should be 15");
  }

  const notebookRanked: CandidateConcept[] = [
    makeConcept("tradeoff-1", "TRADEOFF"),
    makeConcept("data-flow-1", "DATA_FLOW"),
    makeConcept("impl-1", "IMPLEMENTATION_DETAIL"),
  ];
  const orderedNotebook = orderConceptsForTeaching(notebookRanked, "SINGLE_NOTEBOOK", "DATA_SCIENTIST");
  const dataFlowIdx = orderedNotebook.findIndex((c) => c.conceptType === "DATA_FLOW");
  const tradeoffIdx = orderedNotebook.findIndex((c) => c.conceptType === "TRADEOFF");
  assert(
    dataFlowIdx >= 0 && tradeoffIdx >= 0 && dataFlowIdx < tradeoffIdx,
    "For notebook repo: DATA_FLOW should come before TRADEOFF"
  );
  assert(
    orderedNotebook[orderedNotebook.length - 1].conceptType === "IMPLEMENTATION_DETAIL",
    "IMPLEMENTATION_DETAIL should be last in notebook ordering"
  );

  console.log("lessonOrdering.test.ts: all assertions passed.");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
