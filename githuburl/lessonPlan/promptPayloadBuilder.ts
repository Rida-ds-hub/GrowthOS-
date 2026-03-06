/**
 * Builds a lean prompt payload from AnalyseRepoResult + OrderedConcept[].
 * Summarises, selects, and caps — never truncating meaning, only removing noise.
 */

import type { AnalyseRepoResult } from "../index";
import type {
  OrderedConcept,
  PromptPayload,
  PromptRepoMeta,
  PromptPattern,
  PromptCriticalNode,
  PromptConcept,
} from "./types";

const PRIORITY_DOC_NAMES_ORDER = ["readme", "architecture", "design", "overview", "contributing"];
const PRIORITY_DOC_NAMES = new Set(PRIORITY_DOC_NAMES_ORDER.map((s) => s.toLowerCase()));
const PRIORITY_DOC_DIRS = ["docs/", "documentation/", "wiki/"];
const MAX_PATTERNS = 5;
const MAX_CRITICAL_NODES = 5;
const MAX_FRAMEWORKS = 5;
const MAX_ENTRY_POINTS = 3;
const MAX_DOCS_TOTAL = 3;
const CHARS_PER_DOC = 800;
const DOC_SUMMARY_CAP = 2500;

function docSortKey(path: string): [number, number] {
  const normalized = path.replace(/\\/g, "/");
  const basename = normalized.split("/").pop() ?? "";
  const nameWithoutExt = basename.replace(/\.[^.]+$/, "").toLowerCase();
  if (PRIORITY_DOC_NAMES.has(nameWithoutExt)) {
    const idx = PRIORITY_DOC_NAMES_ORDER.indexOf(nameWithoutExt);
    return [0, idx >= 0 ? idx : 99];
  }
  const lower = normalized.toLowerCase();
  if (PRIORITY_DOC_DIRS.some((d) => lower.startsWith(d))) return [1, 0];
  return [2, 0];
}

function selectDocs(docs: { path: string; content: string }[]): { path: string; content: string }[] {
  const sorted = [...docs].sort((a, b) => {
    const [pa, sa] = docSortKey(a.path);
    const [pb, sb] = docSortKey(b.path);
    return pa !== pb ? pa - pb : sa - sb;
  });
  return sorted.slice(0, MAX_DOCS_TOTAL);
}

function extractSignal(content: string, maxChars: number): string {
  let s = content.slice(0, maxChars);
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/\n{2,}/g, "\n");
  return s.trim();
}

function buildDocSummary(docs: { path: string; content: string }[]): string {
  const selected = selectDocs(docs);
  if (selected.length === 0) return "";

  const parts = selected.map((d) => {
    const content = extractSignal(d.content, CHARS_PER_DOC);
    return `[${d.path}]\n${content}`;
  });
  let summary = parts.join("\n\n---\n\n");
  if (summary.length > DOC_SUMMARY_CAP) {
    summary = summary.slice(0, DOC_SUMMARY_CAP) + "\n[...truncated]";
  }
  return summary;
}

function getNodesForCritical(analysis: AnalyseRepoResult): { id: string; inDegree: number; role: string; centrality: boolean }[] {
  const isNotebook = analysis.meta.repoType === "SINGLE_NOTEBOOK";
  if (isNotebook && analysis.notebookAnalysis?.[0]) {
    return analysis.notebookAnalysis[0].dependencyGraph.nodes.map((n) => ({
      id: n.id,
      inDegree: n.inDegree,
      role: n.role,
      centrality: n.centrality,
    }));
  }
  return analysis.dependencyGraph.nodes.map((n) => ({
    id: n.id,
    inDegree: n.inDegree,
    role: n.role,
    centrality: n.centrality,
  }));
}

export function buildPromptPayload(
  analysis: AnalyseRepoResult,
  orderedConcepts: OrderedConcept[]
): PromptPayload {
  const { meta, complexity } = analysis;

  const repoMeta: PromptRepoMeta = {
    repoName: meta.repoName,
    repoType: meta.repoType,
    primaryLanguage: meta.primaryLanguage,
    frameworks: meta.frameworks.slice(0, MAX_FRAMEWORKS),
    entryPoints: meta.entryPoints.slice(0, MAX_ENTRY_POINTS),
    complexityScore: complexity.complexityScore,
    estimatedLessons: complexity.estimatedLessons,
  };

  const topPatterns: PromptPattern[] = [...(analysis.patterns ?? [])]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, MAX_PATTERNS)
    .map((p) => ({ pattern: p.pattern, confidence: p.confidence }));

  const nodes = getNodesForCritical(analysis);
  const topCriticalNodes: PromptCriticalNode[] = nodes
    .filter((n) => n.centrality === true)
    .sort((a, b) => b.inDegree - a.inDegree)
    .slice(0, MAX_CRITICAL_NODES)
    .map((n) => ({ path: n.id, inDegree: n.inDegree, role: n.role }));

  const docSummary = buildDocSummary(analysis.docs ?? []);

  const conceptsPayload: PromptConcept[] = orderedConcepts.map((c) => ({
    id: c.id,
    title: c.title,
    conceptType: c.conceptType,
    fileAnchors: c.fileAnchors.slice(0, 3),
    signal: c.signal,
    dayNumber: c.dayNumber,
  }));

  return {
    repoMeta,
    topPatterns,
    topCriticalNodes,
    docSummary,
    conceptsPayload,
  };
}
