/**
 * Pure TypeScript concept extraction from AnalyseRepoResult.
 * No LLM, no I/O. Fully testable.
 */

import type { AnalyseRepoResult } from "../index";
import type { CandidateConcept, ConceptSource, ConceptType } from "./types";

const PATTERN_TO_ROLES: Record<string, string[]> = {
  MVC: ["MODEL", "BUSINESS_LOGIC", "ENTRY_POINT"],
  TRAINING_PIPELINE: ["DATA_LAYER", "PREPROCESSING", "MODEL", "TRAINING_PIPELINE", "EVALUATION"],
  REST_API: ["ENTRY_POINT", "BUSINESS_LOGIC", "DATA_LAYER"],
  SERVICE_LAYER: ["ENTRY_POINT", "BUSINESS_LOGIC", "DATA_LAYER"],
  MONOREPO: ["CONFIG"],
  NOTEBOOK_NARRATIVE: ["NOTEBOOK"],
};

function slug(id: string): string {
  return id
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function extractConcepts(analysis: AnalyseRepoResult): CandidateConcept[] {
  const concepts: CandidateConcept[] = [];
  const { meta, fileMap, dependencyGraph, notebookAnalysis, patterns, complexity } = analysis;
  const criticalSet = new Set(complexity.criticalNodes);
  const pathToRole = new Map<string, string>();
  for (const f of fileMap.classified) {
    if (f.type === "blob") pathToRole.set(f.path, f.role);
  }
  const nodes = dependencyGraph.nodes;
  const maxInDegree = nodes.length
    ? Math.max(1, ...nodes.map((n) => n.inDegree))
    : 1;

  // From patterns: confidence > 0.5
  for (const p of patterns) {
    if (p.confidence <= 0.5) continue;
    const roles = PATTERN_TO_ROLES[p.pattern] || ["BUSINESS_LOGIC"];
    const anchors = complexity.criticalNodes.filter((path) =>
      roles.includes(pathToRole.get(path) || "")
    );
    if (anchors.length === 0) {
      for (const f of fileMap.classified) {
        if (f.type === "blob" && roles.includes(f.role)) {
          anchors.push(f.path);
          if (anchors.length >= 5) break;
        }
      }
    }
    concepts.push({
      id: `pattern-${slug(p.pattern)}`,
      title: p.pattern.replace(/_/g, " "),
      source: "PATTERN",
      signal: `Pattern detected: ${p.pattern} (confidence ${p.confidence})`,
      relevanceScore: p.confidence,
      roleRelevance: {},
      fileAnchors: anchors.slice(0, 10),
      conceptType: "ARCHITECTURAL_PATTERN",
    });
  }

  // From complexity.criticalNodes
  for (const path of complexity.criticalNodes) {
    const node = nodes.find((n) => n.id === path);
    const inD = node ? node.inDegree : 0;
    const relevanceScore = inD / maxInDegree;
    concepts.push({
      id: `critical-${slug(path)}`,
      title: `Critical file: ${path.split("/").pop() || path}`,
      source: "CRITICAL_NODE",
      signal: `High centrality: ${inD} files depend on this`,
      relevanceScore,
      roleRelevance: {},
      fileAnchors: [path],
      conceptType: "DESIGN_DECISION",
    });
  }

  // From notebookAnalysis
  if (notebookAnalysis && notebookAnalysis.length > 0) {
    notebookAnalysis.forEach((nb, i) => {
      concepts.push({
        id: `notebook-narrative-${i}`,
        title: "Notebook narrative flow",
        source: "NOTEBOOK_NARRATIVE",
        signal: nb.narrative.slice(0, 200) + (nb.narrative.length > 200 ? "..." : ""),
        relevanceScore: 0.8,
        roleRelevance: {},
        fileAnchors: [],
        conceptType: "DATA_FLOW",
      });
    });
  }

  // From dependencyGraph + complexity: maxDepth > 3
  if (complexity.maxDepth > 3) {
    const chainConcept: CandidateConcept = {
      id: "system-boundary-chain",
      title: "Long dependency chain (system boundary)",
      source: "DEPENDENCY_CHAIN",
      signal: `Longest chain depth: ${complexity.maxDepth}`,
      relevanceScore: Math.min(1, complexity.maxDepth / 10),
      roleRelevance: {},
      fileAnchors: complexity.criticalNodes.slice(0, 5),
      conceptType: "SYSTEM_BOUNDARY",
    };
    concepts.push(chainConcept);
  }

  // From fileMap: TEST ratio and CONFIG
  const blobs = fileMap.classified.filter((f) => f.type === "blob");
  const byRole = new Map<string, number>();
  for (const f of blobs) {
    const r = f.role;
    byRole.set(r, (byRole.get(r) || 0) + 1);
  }
  const testCount = byRole.get("TEST") || 0;
  const configCount = byRole.get("CONFIG") || 0;
  const total = blobs.length || 1;
  if (testCount / total > 0.3) {
    concepts.push({
      id: "file-role-testability",
      title: "Testability as design decision",
      source: "FILE_ROLE_DISTRIBUTION",
      signal: `>30% of files are tests (${testCount}/${total})`,
      relevanceScore: 0.7,
      roleRelevance: {},
      fileAnchors: fileMap.classified.filter((f) => f.role === "TEST").slice(0, 5).map((f) => f.path),
      conceptType: "DESIGN_DECISION",
    });
  }
  if (testCount === 0 && total > 0) {
    concepts.push({
      id: "tradeoff-no-tests",
      title: "Tradeoff: absence of tests",
      source: "FILE_ROLE_DISTRIBUTION",
      signal: "No test files — architectural choice worth discussing",
      relevanceScore: 0.6,
      roleRelevance: {},
      fileAnchors: [],
      conceptType: "TRADEOFF",
    });
  }
  if (configCount / total > 0.25) {
    concepts.push({
      id: "file-role-orchestration",
      title: "Configuration and orchestration",
      source: "FILE_ROLE_DISTRIBUTION",
      signal: `Config-heavy (${configCount}/${total} files)`,
      relevanceScore: 0.6,
      roleRelevance: {},
      fileAnchors: fileMap.classified.filter((f) => f.role === "CONFIG").slice(0, 5).map((f) => f.path),
      conceptType: "ORCHESTRATION",
    });
  }

  // Dedupe by (conceptType, primary fileAnchor)
  const seen = new Map<string, CandidateConcept>();
  for (const c of concepts) {
    const primary = c.fileAnchors[0] ?? c.id;
    const key = `${c.conceptType}:${primary}`;
    const existing = seen.get(key);
    if (!existing || c.relevanceScore > existing.relevanceScore) {
      seen.set(key, c);
    }
  }
  return [...seen.values()];
}
