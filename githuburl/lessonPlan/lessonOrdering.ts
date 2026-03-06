/**
 * Order concepts for teaching. Pure TypeScript, no LLM.
 */

import type { CandidateConcept, OrderedConcept, TargetRole } from "./types";

const NOTEBOOK_REPO_TYPES = new Set(["SINGLE_NOTEBOOK", "NOTEBOOK_WITH_SCRIPTS"]);
const ESTIMATED_MINUTES = 15;

const TYPE_ORDER: Record<string, number> = {
  ARCHITECTURAL_PATTERN: 0,
  DATA_FLOW: 1,
  SYSTEM_BOUNDARY: 2,
  ORCHESTRATION: 3,
  DESIGN_DECISION: 4,
  TRADEOFF: 5,
  IMPLEMENTATION_DETAIL: 6,
};

function typeRank(t: string): number {
  return TYPE_ORDER[t] ?? 4;
}

export function orderConceptsForTeaching(
  rankedConcepts: CandidateConcept[],
  repoType: string,
  targetRole: TargetRole
): OrderedConcept[] {
  const isNotebookRepo = NOTEBOOK_REPO_TYPES.has(repoType);
  const indexed = rankedConcepts.map((c, i) => ({ c, i }));

  const pmTradeoffs = indexed.filter((x) => targetRole === "PRODUCT_MANAGER" && x.c.conceptType === "TRADEOFF");
  const rest = indexed.filter((x) => !(targetRole === "PRODUCT_MANAGER" && x.c.conceptType === "TRADEOFF"));

  const sortedRest = rest.sort((a, b) => {
    const orderA = typeRank(a.c.conceptType);
    const orderB = typeRank(b.c.conceptType);
    if (orderA !== orderB) return orderA - orderB;
    return a.i - b.i;
  });

  const implDetail: typeof indexed = [];
  const nonImpl: typeof indexed = [];
  for (const x of sortedRest) {
    if (x.c.conceptType === "IMPLEMENTATION_DETAIL") implDetail.push(x);
    else nonImpl.push(x);
  }

  const dataFlow = nonImpl.filter((x) => x.c.conceptType === "DATA_FLOW");
  const tradeoff = nonImpl.filter((x) => x.c.conceptType === "TRADEOFF");
  const others = nonImpl.filter(
    (x) => x.c.conceptType !== "DATA_FLOW" && x.c.conceptType !== "TRADEOFF"
  );

  let reordered: CandidateConcept[];
  if (isNotebookRepo) {
    reordered = [
      ...pmTradeoffs.slice(0, 3).map((x) => x.c),
      ...others.map((x) => x.c),
      ...dataFlow.map((x) => x.c),
      ...tradeoff.filter((x) => !pmTradeoffs.includes(x)).map((x) => x.c),
      ...implDetail.map((x) => x.c),
    ];
  } else {
    reordered = [
      ...pmTradeoffs.slice(0, 3).map((x) => x.c),
      ...others.map((x) => x.c),
      ...dataFlow.map((x) => x.c),
      ...tradeoff.filter((x) => !pmTradeoffs.includes(x)).map((x) => x.c),
      ...implDetail.map((x) => x.c),
    ];
  }

  const withDay: OrderedConcept[] = reordered.map((c, i) => ({
    ...c,
    dayNumber: i + 1,
    estimatedMinutes: ESTIMATED_MINUTES,
  }));
  return withDay;
}
