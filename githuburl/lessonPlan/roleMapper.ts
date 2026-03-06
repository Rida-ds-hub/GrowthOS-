/**
 * Role-based concept ranking. Pure TypeScript, no LLM.
 */

import type { CandidateConcept, ConceptType, TargetRole } from "./types";

const ROLE_RELEVANCE_MATRIX: Record<ConceptType, Partial<Record<TargetRole, number>>> = {
  ARCHITECTURAL_PATTERN: {
    SOFTWARE_ENGINEER: 0.9,
    BACKEND_ENGINEER: 0.9,
    FULLSTACK_ENGINEER: 0.8,
    ML_ENGINEER: 0.7,
    DATA_ENGINEER: 0.7,
    DEVOPS_ENGINEER: 0.6,
    FRONTEND_ENGINEER: 0.5,
    DATA_SCIENTIST: 0.4,
    DATA_ANALYST: 0.5,
    PRODUCT_MANAGER: 0.3,
  },
  DESIGN_DECISION: {
    SOFTWARE_ENGINEER: 0.9,
    BACKEND_ENGINEER: 0.85,
    ML_ENGINEER: 0.8,
    FULLSTACK_ENGINEER: 0.8,
    DATA_ENGINEER: 0.8,
    PRODUCT_MANAGER: 0.7,
    DEVOPS_ENGINEER: 0.6,
    FRONTEND_ENGINEER: 0.6,
    DATA_ANALYST: 0.6,
    DATA_SCIENTIST: 0.5,
  },
  TRADEOFF: {
    PRODUCT_MANAGER: 1.0,
    SOFTWARE_ENGINEER: 0.9,
    ML_ENGINEER: 0.9,
    DATA_ENGINEER: 0.9,
    BACKEND_ENGINEER: 0.85,
    FULLSTACK_ENGINEER: 0.8,
    DATA_ANALYST: 0.8,
    DATA_SCIENTIST: 0.7,
    DEVOPS_ENGINEER: 0.7,
    FRONTEND_ENGINEER: 0.6,
  },
  DATA_FLOW: {
    ML_ENGINEER: 1.0,
    DATA_SCIENTIST: 1.0,
    DATA_ANALYST: 1.0,
    DATA_ENGINEER: 1.0,
    BACKEND_ENGINEER: 0.8,
    SOFTWARE_ENGINEER: 0.7,
    FULLSTACK_ENGINEER: 0.7,
    DEVOPS_ENGINEER: 0.6,
    FRONTEND_ENGINEER: 0.4,
    PRODUCT_MANAGER: 0.3,
  },
  SYSTEM_BOUNDARY: {
    SOFTWARE_ENGINEER: 0.9,
    BACKEND_ENGINEER: 0.9,
    DATA_ENGINEER: 0.9,
    DEVOPS_ENGINEER: 0.85,
    ML_ENGINEER: 0.8,
    FULLSTACK_ENGINEER: 0.8,
    PRODUCT_MANAGER: 0.6,
    DATA_SCIENTIST: 0.5,
    DATA_ANALYST: 0.4,
    FRONTEND_ENGINEER: 0.5,
  },
  ORCHESTRATION: {
    DEVOPS_ENGINEER: 1.0,
    DATA_ENGINEER: 1.0,
    ML_ENGINEER: 0.9,
    BACKEND_ENGINEER: 0.8,
    SOFTWARE_ENGINEER: 0.8,
    FULLSTACK_ENGINEER: 0.7,
    DATA_SCIENTIST: 0.6,
    DATA_ANALYST: 0.5,
    PRODUCT_MANAGER: 0.4,
    FRONTEND_ENGINEER: 0.3,
  },
  IMPLEMENTATION_DETAIL: {
    SOFTWARE_ENGINEER: 0.7,
    FRONTEND_ENGINEER: 0.7,
    FULLSTACK_ENGINEER: 0.6,
    BACKEND_ENGINEER: 0.6,
    ML_ENGINEER: 0.5,
    DATA_SCIENTIST: 0.5,
    DATA_ENGINEER: 0.5,
    DEVOPS_ENGINEER: 0.4,
    DATA_ANALYST: 0.3,
    PRODUCT_MANAGER: 0.1,
  },
};

const CAP_CONCEPTS = 20;
const MIN_FINAL_SCORE = 0.2;

export function rankConceptsForRole(
  concepts: CandidateConcept[],
  targetRole: TargetRole
): CandidateConcept[] {
  const matrix = ROLE_RELEVANCE_MATRIX;
  const withScore = concepts.map((c) => {
    const roleWeight = matrix[c.conceptType][targetRole] ?? 0.5;
    const finalScore = c.relevanceScore * roleWeight;
    const roleRelevance: Partial<Record<TargetRole, number>> = {};
    const row = matrix[c.conceptType];
    if (row) {
      (Object.keys(row) as TargetRole[]).forEach((role) => {
        roleRelevance[role] = row[role];
      });
    }
    return { concept: c, finalScore, roleRelevance };
  });
  const filtered = withScore.filter((x) => x.finalScore >= MIN_FINAL_SCORE);
  const sorted = filtered.sort((a, b) => b.finalScore - a.finalScore);
  const capped = sorted.slice(0, CAP_CONCEPTS);
  return capped.map(({ concept, roleRelevance }) => ({
    ...concept,
    roleRelevance,
  }));
}
