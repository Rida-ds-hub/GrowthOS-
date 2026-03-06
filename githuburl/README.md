# githuburl — Repo analysis module

Self-contained module that analyses a GitHub repository from its URL: validates the URL, fetches metadata and file tree, classifies repo type and file roles, extracts dependencies (or runs the notebook pipeline for `.ipynb` repos), detects architectural patterns, and scores complexity. The **lesson plan generator** sub-module (`generateLessonPlan`) uses an LLM (Gemini) to produce structured lesson plans from analysis results. **No UI, no database.**

## Public API

- **`analyseRepo(url: string): Promise<AnalyseRepoResult>`** — Single entry point. Pass a GitHub repo URL (e.g. `https://github.com/owner/repo`). Returns the full analysis object.
- **`generateLessonPlan(analysis: AnalyseRepoResult, targetRole: TargetRole): Promise<LessonPlan>`** — Consumes analysis output and a target role (e.g. `ML_ENGINEER`, `PRODUCT_MANAGER`) and returns a lesson plan with design decisions, ordered lessons, and test questions. Requires **`GEMINI_API_KEY`** to be set.

## Environment

- **`GITHUB_TOKEN`** (optional) — GitHub personal access token. When set, used for higher API rate limits and access to private repos. Without it, requests are unauthenticated (lower rate limits; acceptable for MVP).
- **`GEMINI_API_KEY`** (required for `generateLessonPlan`) — Google Gemini API key. Used by the lesson plan generator for design decisions, lesson stubs, and test-question generation. Add to `.env.local` when using `generateLessonPlan`.
- **`GITHUBURL_MAX_NOTEBOOK_MB`** (optional) — Max size in megabytes for a single `.ipynb` file to fetch and analyse. Default 30 MB; clamped between 1 and 100. Use this to support very large notebooks or to lower the cap for performance.

## Size limits

Content is only fetched for files under these caps (files over the limit are skipped; analysis still runs on metadata and smaller files):

- **Code files** (for dependency extraction): 500 KB per file (`MAX_FILE_SIZE_FOR_CONTENT`).
- **Notebooks** (`.ipynb`): 30 MB per file by default (`MAX_NOTEBOOK_FILE_SIZE`). Override with `GITHUBURL_MAX_NOTEBOOK_MB` (1–100) if needed.
- **Documentation** (`.md`/`.mdx`): 500 KB per file, up to 50 files per repo.

Oversized files are excluded from content fetching; they still appear in `fileMap.classified` and `rawFileTree` with their roles and sizes. `notebookAnalysis` will not include notebooks that exceed the notebook size cap.

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
  docs: Array<{ path: string; content: string }>;
  docsTruncated?: boolean;  // true if there were more eligible .md/.mdx files than fetched
}
```

- **meta** — Repo metadata, primary language, repo type, framework hints, entry point candidates.
- **fileMap** — Total file count and every file with its classified role (ENTRY_POINT, CONFIG, MODEL, TEST, NOTEBOOK, etc.).
- **dependencyGraph** — Import/require-based graph for non-notebook code; nodes include in/out degree and centrality flag.
- **notebookAnalysis** — For repos with notebooks: per-notebook cell graph, narrative (concatenated markdown), and cell analysis; `null` if none.
- **patterns** — Detected patterns (e.g. MVC, TRAINING_PIPELINE, REST_API, NOTEBOOK_NARRATIVE) with confidence in [0, 1].
- **complexity** — File count, graph depth, critical nodes, 1–10 score, and estimated lesson count.
- **rawFileTree** — Flat list of paths, types, and sizes from the GitHub tree API.
- **docs** — Array of fetched documentation files (README and other Markdown) with their repo paths and full text content (size- and count-limited).
- **docsTruncated** — Indicates that not all eligible `.md`/`.mdx` files were fetched because of the `MAX_DOC_FILES` cap.

## Usage

From the app (when integrated):

```ts
import { analyseRepo } from "./githuburl";  // or from "@/githuburl" if moved under src

const result = await analyseRepo("https://github.com/owner/repo");
console.log(result.meta.repoType, result.complexity.complexityScore);
```

## What this module does not do

- No UI
- No database writes
- No integration with the rest of the app (until you wire it)
- No authentication flow
