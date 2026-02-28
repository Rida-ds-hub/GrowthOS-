/**
 * Step 8: Public API. Single entry point analyseRepo(url).
 */

import { validateAndFetchRepo, fetchFileContent } from "./fetcher";
import { classifyRepoType, classifyFiles } from "./classifier";
import { extractDependencies, type FileWithContent } from "./dependencies";
import { analyseNotebook } from "./notebook";
import { detectArchitecturalPatterns } from "./patterns";
import { scoreComplexity } from "./complexity";
import { MAX_FILE_SIZE_FOR_CONTENT } from "./utils";
import type { FileTreeItem } from "./utils";
import type { ClassifiedFile } from "./classifier";
import type { DependencyGraph } from "./dependencies";
import type { NotebookAnalysisResult } from "./notebook";
import type { PatternMatch } from "./patterns";
import type { ComplexityResult } from "./complexity";

export interface AnalyseRepoMeta {
  repoName: string;
  repoUrl: string;
  description: string | null;
  primaryLanguage: string;
  repoType: string;
  frameworks: string[];
  entryPoints: string[];
}

export interface AnalyseRepoFileMap {
  total: number;
  classified: ClassifiedFile[];
}

export interface AnalyseRepoResult {
  meta: AnalyseRepoMeta;
  fileMap: AnalyseRepoFileMap;
  dependencyGraph: DependencyGraph;
  notebookAnalysis: NotebookAnalysisResult[] | null;
  patterns: PatternMatch[];
  complexity: ComplexityResult;
  rawFileTree: FileTreeItem[];
}

const CODE_EXTENSIONS = new Set([
  ".py", ".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs",
]);
const SKIP_ROLES_FOR_DEPS = new Set(["CONFIG", "DOCUMENTATION", "INFRASTRUCTURE", "UNKNOWN"]);

export async function analyseRepo(url: string): Promise<AnalyseRepoResult> {
  const fetched = await validateAndFetchRepo(url);
  const { owner, repo, defaultBranch, fileTree, languageBreakdown } = fetched;

  const { repoType, primaryLanguage, frameworkHints, entryPoints } = classifyRepoType(
    fileTree,
    languageBreakdown
  );
  const classified = classifyFiles(fileTree, repoType);

  let dependencyGraph: DependencyGraph = { nodes: [], edges: [] };
  let notebookAnalysis: NotebookAnalysisResult[] | null = null;

  const notebooks = classified.filter(
    (f) => f.type === "blob" && f.role === "NOTEBOOK" && (f.size ?? 0) <= MAX_FILE_SIZE_FOR_CONTENT
  );
  const codeFilesForDeps = classified.filter(
    (f) =>
      f.type === "blob" &&
      !SKIP_ROLES_FOR_DEPS.has(f.role) &&
      (f.size ?? 0) <= MAX_FILE_SIZE_FOR_CONTENT &&
      CODE_EXTENSIONS.has(f.path.includes(".") ? "." + f.path.split(".").pop()!.toLowerCase() : "")
  );

  if (notebooks.length > 0) {
    const results: NotebookAnalysisResult[] = [];
    for (const nb of notebooks) {
      const content = await fetchFileContent(
        owner,
        repo,
        nb.path,
        defaultBranch,
        MAX_FILE_SIZE_FOR_CONTENT
      );
      if (content) {
        results.push(analyseNotebook(content));
      }
    }
    notebookAnalysis = results.length > 0 ? results : null;
  }

  if (codeFilesForDeps.length > 0) {
    const filesWithContent: FileWithContent[] = [];
    for (const f of codeFilesForDeps) {
      const content = await fetchFileContent(
        owner,
        repo,
        f.path,
        defaultBranch,
        MAX_FILE_SIZE_FOR_CONTENT
      );
      if (content != null) {
        filesWithContent.push({ path: f.path, content, role: f.role });
      }
    }
    const allBlobPaths = classified.filter((x) => x.type === "blob").map((x) => x.path);
    dependencyGraph = extractDependencies(filesWithContent, repoType, allBlobPaths);
  }

  const patterns = detectArchitecturalPatterns(dependencyGraph, classified, repoType);
  const complexity = scoreComplexity(dependencyGraph, classified);

  return {
    meta: {
      repoName: fetched.repoName,
      repoUrl: fetched.repoUrl,
      description: fetched.description,
      primaryLanguage,
      repoType,
      frameworks: frameworkHints,
      entryPoints,
    },
    fileMap: {
      total: fetched.totalFileCount,
      classified,
    },
    dependencyGraph,
    notebookAnalysis,
    patterns,
    complexity,
    rawFileTree: fileTree,
  };
}
