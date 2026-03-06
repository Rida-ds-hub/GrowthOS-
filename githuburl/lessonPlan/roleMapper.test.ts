/**
 * Tests for roleMapper. Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' roleMapper.test.ts
 */

import type { CandidateConcept, TargetRole } from "./types";
import { rankConceptsForRole } from "./roleMapper";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function makeConcept(
  id: string,
  conceptType: CandidateConcept["conceptType"],
  relevanceScore: number
): CandidateConcept {
  return {
    id,
    title: id,
    source: "PATTERN",
    signal: "",
    relevanceScore,
    roleRelevance: {},
    fileAnchors: [],
    conceptType,
  };
}

async function runTests(): Promise<void> {
  const concepts: CandidateConcept[] = [
    makeConcept("data-flow-1", "DATA_FLOW", 0.8),
    makeConcept("arch-1", "ARCHITECTURAL_PATTERN", 0.9),
    makeConcept("orchestration-1", "ORCHESTRATION", 0.7),
    makeConcept("tradeoff-1", "TRADEOFF", 0.6),
    makeConcept("design-1", "DESIGN_DECISION", 0.85),
  ];

  const forPM = rankConceptsForRole(concepts, "PRODUCT_MANAGER");
  const forML = rankConceptsForRole(concepts, "ML_ENGINEER");
  const forDE = rankConceptsForRole(concepts, "DATA_ENGINEER");
  const forDA = rankConceptsForRole(concepts, "DATA_ANALYST");

  // Order should differ by role (TRADEOFF tops for PM, DATA_FLOW for data roles)
  assert(forPM.length > 0, "PM: expected non-empty");
  assert(forML.length > 0, "ML: expected non-empty");
  assert(forDA.length > 0, "DA: expected non-empty");
  assert(forDE.length > 0, "DE: expected non-empty");

  const pmFirst = forPM[0];
  const mlFirst = forML[0];
  assert(
    pmFirst.conceptType === "TRADEOFF" || mlFirst.conceptType !== pmFirst.conceptType,
    "Order should differ: PM vs ML"
  );

  // DATA_FLOW should have roleRelevance 1.0 for data roles
  const dataFlowForML = forML.find((c) => c.conceptType === "DATA_FLOW");
  const dataFlowForDA = forDA.find((c) => c.conceptType === "DATA_FLOW");
  const dataFlowForDE = forDE.find((c) => c.conceptType === "DATA_FLOW");
  if (dataFlowForML) {
    assert(
      dataFlowForML.roleRelevance?.ML_ENGINEER === 1.0,
      "DATA_FLOW: ML_ENGINEER relevance should be 1.0"
    );
  }
  if (dataFlowForDA) {
    assert(
      dataFlowForDA.roleRelevance?.DATA_ANALYST === 1.0,
      "DATA_FLOW: DATA_ANALYST relevance should be 1.0"
    );
  }
  if (dataFlowForDE) {
    assert(
      dataFlowForDE.roleRelevance?.DATA_ENGINEER === 1.0,
      "DATA_FLOW: DATA_ENGINEER relevance should be 1.0"
    );
  }

  // ORCHESTRATION should score 1.0 for DATA_ENGINEER
  const orchForDE = forDE.find((c) => c.conceptType === "ORCHESTRATION");
  if (orchForDE) {
    assert(
      orchForDE.roleRelevance?.DATA_ENGINEER === 1.0,
      "ORCHESTRATION: DATA_ENGINEER relevance should be 1.0"
    );
  }

  // Cap at 20
  const manyConcepts: CandidateConcept[] = Array.from({ length: 30 }, (_, i) =>
    makeConcept(`c-${i}`, "DESIGN_DECISION", 0.9)
  );
  const capped = rankConceptsForRole(manyConcepts, "SOFTWARE_ENGINEER");
  assert(capped.length <= 20, "Should cap at 20 concepts");

  // Filter finalScore >= 0.2
  const lowRelevance = makeConcept("low", "IMPLEMENTATION_DETAIL", 0.1);
  const lowRanked = rankConceptsForRole([lowRelevance], "SOFTWARE_ENGINEER");
  assert(lowRanked.length === 0, "Low finalScore should be filtered out");

  console.log("roleMapper.test.ts: all assertions passed.");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
