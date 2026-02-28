/**
 * Step 7: Complexity scoring from dependency graph and classified files.
 */

import type { DependencyGraph, DepNode } from "./dependencies";
import type { ClassifiedFile } from "./classifier";

const MEANINGLESS_ROLES = new Set([
  "CONFIG",
  "DOCUMENTATION",
  "INFRASTRUCTURE",
  "UNKNOWN",
]);

export interface ComplexityResult {
  fileCount: number;
  maxDepth: number;
  avgDependencies: number;
  criticalNodes: string[];
  complexityScore: number;
  estimatedLessons: number;
}

function computeMaxDepth(nodes: DepNode[], edges: { from: string; to: string }[]): number {
  const outEdges = new Map<string, string[]>();
  for (const e of edges) {
    const list = outEdges.get(e.from) ?? [];
    list.push(e.to);
    outEdges.set(e.from, list);
  }
  const ids = new Set(nodes.map((n) => n.id));
  let maxDepth = 0;
  function depthFrom(id: string, visited: Set<string>): number {
    if (visited.has(id)) return 0;
    visited.add(id);
    const targets = outEdges.get(id) ?? [];
    if (targets.length === 0) return 1;
    let d = 0;
    for (const t of targets) {
      d = Math.max(d, 1 + depthFrom(t, new Set(visited)));
    }
    return d;
  }
  for (const id of ids) {
    maxDepth = Math.max(maxDepth, depthFrom(id, new Set()));
  }
  return maxDepth;
}

export function scoreComplexity(
  dependencyGraph: DependencyGraph,
  classifiedFiles: ClassifiedFile[]
): ComplexityResult {
  const meaningfulFiles = classifiedFiles.filter(
    (f) => f.type === "blob" && !MEANINGLESS_ROLES.has(f.role)
  );
  const fileCount = meaningfulFiles.length;

  const { nodes, edges } = dependencyGraph;
  const maxDepth = computeMaxDepth(nodes, edges);

  const totalEdges = edges.length;
  const avgDependencies = nodes.length > 0 ? totalEdges / nodes.length : 0;

  const criticalNodes = nodes.filter((n) => n.centrality).map((n) => n.id);

  let complexityScore = 1;
  if (fileCount > 0) {
    complexityScore += Math.min(3, Math.log10(fileCount + 1) * 2);
  }
  complexityScore += Math.min(2, maxDepth * 0.3);
  complexityScore += Math.min(2, avgDependencies * 0.2);
  if (criticalNodes.length > 0) {
    complexityScore += Math.min(2, criticalNodes.length * 0.2);
  }
  complexityScore = Math.max(1, Math.min(10, Math.round(complexityScore)));

  const estimatedLessons = Math.min(20, Math.ceil(complexityScore * 1.5));

  return {
    fileCount,
    maxDepth,
    avgDependencies: Math.round(avgDependencies * 100) / 100,
    criticalNodes,
    complexityScore,
    estimatedLessons,
  };
}
