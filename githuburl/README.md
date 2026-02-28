# githuburl — Repo analysis module

Self-contained module that analyses a GitHub repository from its URL: validates the URL, fetches metadata and file tree, classifies repo type and file roles, extracts dependencies (or runs the notebook pipeline for `.ipynb` repos), detects architectural patterns, and scores complexity. **No UI, no LLM, no database.** The output is intended as input to a future LLM reasoning stage (e.g. lesson generation).

## Public API

- **`analyseRepo(url: string): Promise<AnalyseRepoResult>`** — Single entry point. Pass a GitHub repo URL (e.g. `https://github.com/owner/repo`). Returns the full analysis object.

## Environment

- **`GITHUB_TOKEN`** (optional) — GitHub personal access token. When set, used for higher API rate limits and access to private repos. Without it, requests are unauthenticated (lower rate limits; acceptable for MVP).

## Output shape

```ts
{
  meta: {
    repoName: string;
    repoUrl: string;
    description: string | null;
    primaryLanguage: string;
    repoType: string;        // e.g. PYTHON_PROJECT, SINGLE_NOTEBOOK, JAVASCRIPT_PROJECT, ...
    frameworks: string[];    // e.g. ["Python", "JavaScript/Node"]
    entryPoints: string[];   // e.g. ["main.py", "index.js"]
  };
  fileMap: {
    total: number;
    classified: Array<{ path, type, size?, role, ... }>;
  };
  dependencyGraph: {
    nodes: Array<{ id, role, definitions, inDegree, outDegree, centrality }>;
    edges: Array<{ from, to, type: "IMPORTS" }>;
  };
  notebookAnalysis: Array<{ dependencyGraph, narrative, cells }> | null;
  patterns: Array<{ pattern: string, confidence: number }>;
  complexity: {
    fileCount: number;
    maxDepth: number;
    avgDependencies: number;
    criticalNodes: string[];
    complexityScore: number;   // 1–10
    estimatedLessons: number;
  };
  rawFileTree: Array<{ path, type, size? }>;
}
```

- **meta** — Repo metadata, primary language, repo type, framework hints, entry point candidates.
- **fileMap** — Total file count and every file with its classified role (ENTRY_POINT, CONFIG, MODEL, TEST, NOTEBOOK, etc.).
- **dependencyGraph** — Import/require-based graph for non-notebook code; nodes include in/out degree and centrality flag.
- **notebookAnalysis** — For repos with notebooks: per-notebook cell graph, narrative (concatenated markdown), and cell analysis; `null` if none.
- **patterns** — Detected patterns (e.g. MVC, TRAINING_PIPELINE, REST_API, NOTEBOOK_NARRATIVE) with confidence in [0, 1].
- **complexity** — File count, graph depth, critical nodes, 1–10 score, and estimated lesson count.
- **rawFileTree** — Flat list of paths, types, and sizes from the GitHub tree API.

## Usage

From the app (when integrated):

```ts
import { analyseRepo } from "./githuburl";  // or from "@/githuburl" if moved under src

const result = await analyseRepo("https://github.com/owner/repo");
console.log(result.meta.repoType, result.complexity.complexityScore);
```

## What this module does not do

- No UI
- No LLM calls
- No database writes
- No integration with the rest of the app (until you wire it)
- No authentication flow
- No lesson generation
