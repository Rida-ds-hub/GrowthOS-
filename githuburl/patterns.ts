/**
 * Step 6: Detect architectural patterns from dependency graph and classified files.
 * Deterministic matching only.
 */

import type { DependencyGraph, DepEdge } from "./dependencies";
import type { ClassifiedFile } from "./classifier";
import type { RepoType } from "./classifier";

export interface PatternMatch {
  pattern: string;
  confidence: number;
}

function getPathsByRole(classified: ClassifiedFile[]): Map<string, string[]> {
  const byRole = new Map<string, string[]>();
  for (const f of classified) {
    if (f.type !== "blob") continue;
    const list = byRole.get(f.role) ?? [];
    list.push(f.path);
    byRole.set(f.role, list);
  }
  return byRole;
}

function pathHasSegment(path: string, segment: string): boolean {
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  return (
    normalized === segment ||
    normalized.startsWith(segment + "/") ||
    normalized.includes("/" + segment + "/") ||
    normalized.endsWith("/" + segment)
  );
}

function hasDirectory(paths: string[], name: string): boolean {
  return paths.some((p) => pathHasSegment(p, name));
}

export function detectArchitecturalPatterns(
  dependencyGraph: DependencyGraph,
  classifiedFiles: ClassifiedFile[],
  repoType: RepoType
): PatternMatch[] {
  const results: PatternMatch[] = [];
  const paths = classifiedFiles.filter((f) => f.type === "blob").map((f) => f.path);
  const byRole = getPathsByRole(classifiedFiles);
  const edgesByFrom = new Map<string, DepEdge[]>();
  for (const e of dependencyGraph.edges) {
    const list = edgesByFrom.get(e.from) ?? [];
    list.push(e);
    edgesByFrom.set(e.from, list);
  }

  // MVC: models/, views/, controllers/ or equivalents
  const hasModels = hasDirectory(paths, "models");
  const hasViews = hasDirectory(paths, "views") || hasDirectory(paths, "templates");
  const hasControllers = hasDirectory(paths, "controllers") || hasDirectory(paths, "routes");
  let mvcScore = 0;
  if (hasModels) mvcScore += 0.4;
  if (hasViews) mvcScore += 0.35;
  if (hasControllers) mvcScore += 0.35;
  if (mvcScore > 0) {
    results.push({ pattern: "MVC", confidence: Math.min(1, mvcScore) });
  }

  // Training pipeline: linear flow data -> preprocessing -> feature eng -> model -> evaluation
  const hasData = (byRole.get("DATA_LAYER")?.length ?? 0) > 0 || hasDirectory(paths, "data");
  const hasPreprocess = (byRole.get("PREPROCESSING")?.length ?? 0) > 0;
  const hasModel = (byRole.get("MODEL")?.length ?? 0) > 0;
  const hasTraining = (byRole.get("TRAINING_PIPELINE")?.length ?? 0) > 0;
  const hasEval = (byRole.get("EVALUATION")?.length ?? 0) > 0;
  let trainScore = 0;
  if (hasData) trainScore += 0.25;
  if (hasPreprocess) trainScore += 0.2;
  if (hasModel) trainScore += 0.25;
  if (hasTraining) trainScore += 0.2;
  if (hasEval) trainScore += 0.2;
  if (trainScore > 0 && (repoType === "PYTHON_PROJECT" || repoType === "NOTEBOOK_WITH_SCRIPTS" || repoType === "SINGLE_NOTEBOOK")) {
    results.push({ pattern: "TRAINING_PIPELINE", confidence: Math.min(1, trainScore) });
  }

  // REST API: route definitions, request/response, middleware
  const hasRoutes = hasDirectory(paths, "routes") || hasDirectory(paths, "api") || (byRole.get("ENTRY_POINT")?.length ?? 0) > 0;
  const hasMiddleware = paths.some((p) => /middleware|middlewares/.test(p.toLowerCase()));
  let restScore = 0;
  if (hasRoutes) restScore += 0.5;
  if (hasMiddleware) restScore += 0.3;
  if (paths.some((p) => /route|router|app\.(get|post|put|delete)/.test(p))) restScore += 0.2;
  if (restScore > 0) {
    results.push({ pattern: "REST_API", confidence: Math.min(1, restScore) });
  }

  // Service layer: separation of routes / business logic / data access
  const hasBusiness = (byRole.get("BUSINESS_LOGIC")?.length ?? 0) > 0;
  const hasDataLayer = (byRole.get("DATA_LAYER")?.length ?? 0) > 0;
  let serviceScore = 0;
  if (hasRoutes && hasBusiness) serviceScore += 0.4;
  if (hasDataLayer) serviceScore += 0.3;
  if (hasDirectory(paths, "services") || hasDirectory(paths, "service")) serviceScore += 0.3;
  if (serviceScore > 0) {
    results.push({ pattern: "SERVICE_LAYER", confidence: Math.min(1, serviceScore) });
  }

  // Monorepo: multiple package.json or setup.py at different levels
  const rootPackage = paths.filter((p) => p === "package.json" || p.endsWith("/package.json"));
  const rootSetup = paths.filter((p) => p === "setup.py" || p.endsWith("/setup.py"));
  const multiRoot = rootPackage.length + rootSetup.length > 1;
  if (multiRoot) {
    results.push({ pattern: "MONOREPO", confidence: Math.min(1, 0.5 + (rootPackage.length + rootSetup.length) * 0.15) });
  }

  // Notebook narrative: single or dominant notebook, linear story
  const notebooks = byRole.get("NOTEBOOK") ?? [];
  const totalCode = classifiedFiles.filter((f) => f.type === "blob").length;
  if (repoType === "SINGLE_NOTEBOOK" && notebooks.length >= 1) {
    results.push({ pattern: "NOTEBOOK_NARRATIVE", confidence: 0.9 });
  } else if (repoType === "NOTEBOOK_WITH_SCRIPTS" && notebooks.length >= 1 && notebooks.length >= totalCode * 0.3) {
    results.push({ pattern: "NOTEBOOK_NARRATIVE", confidence: 0.5 });
  }

  return results;
}
