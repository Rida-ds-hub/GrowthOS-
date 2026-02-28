/**
 * Steps 2 & 3: Repo type classification and file role classification.
 * Deterministic logic only — no LLM.
 */

import type { FileTreeItem } from "./utils";

// --- Repo types (Step 2) ---
export type RepoType =
  | "SINGLE_NOTEBOOK"
  | "NOTEBOOK_WITH_SCRIPTS"
  | "PYTHON_PROJECT"
  | "JAVASCRIPT_PROJECT"
  | "MULTI_LANGUAGE"
  | "INFRASTRUCTURE_ONLY"
  | "UNKNOWN";

export interface ClassifyRepoTypeResult {
  repoType: RepoType;
  primaryLanguage: string;
  frameworkHints: string[];
  entryPoints: string[];
}

// --- File roles (Step 3) ---
export type FileRole =
  | "ENTRY_POINT"
  | "CONFIG"
  | "DATA_LAYER"
  | "BUSINESS_LOGIC"
  | "MODEL"
  | "TRAINING_PIPELINE"
  | "EVALUATION"
  | "PREPROCESSING"
  | "UTILITY"
  | "TEST"
  | "INFRASTRUCTURE"
  | "DOCUMENTATION"
  | "NOTEBOOK"
  | "UNKNOWN";

export interface ClassifiedFile extends FileTreeItem {
  role: FileRole;
  isNotebookPipeline?: boolean;
}

// --- Extension counts for repo type ---
function countExtensions(fileTree: FileTreeItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of fileTree) {
    if (item.type !== "blob") continue;
    const ext = item.path.includes(".")
      ? "." + item.path.split(".").pop()!.toLowerCase()
      : "";
    if (ext) {
      counts[ext] = (counts[ext] || 0) + 1;
    }
  }
  return counts;
}

const CODE_EXTENSIONS = new Set([
  ".py",
  ".ipynb",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".scala",
  ".rb",
  ".php",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".r",
  ".R",
  ".swift",
  ".m",
  ".mm",
]);
const CONFIG_EXTENSIONS = new Set([
  ".yml",
  ".yaml",
  ".json",
  ".toml",
  ".ini",
  ".cfg",
  ".env",
  ".xml",
]);
const CONFIG_NAMES = new Set([
  "dockerfile",
  "docker-compose",
  "makefile",
  "gemfile",
  "rakefile",
  "procfile",
  ".gitignore",
  ".dockerignore",
  ".env.example",
  "config",
]);

const ENTRY_POINT_PATTERNS = [
  /^main\.py$/i,
  /^index\.(js|ts|jsx|tsx)$/i,
  /^app\.py$/i,
  /^server\.(js|ts)$/i,
  /^__main__\.py$/i,
  /^run\.(py|js|ts)$/i,
  /^start\.(js|ts)$/i,
  /^cli\.(py|js|ts)$/i,
];

const FRAMEWORK_FILES: Record<string, string> = {
  "requirements.txt": "Python",
  "setup.py": "Python",
  "pyproject.toml": "Python",
  "package.json": "JavaScript/Node",
  "go.mod": "Go",
  "Cargo.toml": "Rust",
  "pom.xml": "Java/Maven",
  "build.gradle": "Java/Gradle",
  "build.gradle.kts": "Kotlin",
};

/**
 * Step 2: Classify repo type from file tree and language breakdown.
 */
export function classifyRepoType(
  fileTree: FileTreeItem[],
  languageBreakdown: Record<string, number>
): ClassifyRepoTypeResult {
  const extCounts = countExtensions(fileTree);
  const blobs = fileTree.filter((f) => f.type === "blob");
  const totalCode = blobs.filter((f) => {
    const ext = f.path.includes(".") ? "." + f.path.split(".").pop()!.toLowerCase() : "";
    return CODE_EXTENSIONS.has(ext);
  }).length;
  const ipynbCount = extCounts[".ipynb"] || 0;
  const pyCount = extCounts[".py"] || 0;
  const jsCount =
    (extCounts[".js"] || 0) +
    (extCounts[".ts"] || 0) +
    (extCounts[".jsx"] || 0) +
    (extCounts[".tsx"] || 0);

  const frameworkHints: string[] = [];
  const entryPoints: string[] = [];
  const pathSegments = (p: string) => p.replace(/^\/+/, "").split("/");

  for (const item of blobs) {
    const base = pathSegments(item.path).pop()?.toLowerCase() || "";
    const hint = FRAMEWORK_FILES[base] ?? FRAMEWORK_FILES[item.path.split("/").pop() || ""];
    if (hint && !frameworkHints.includes(hint)) {
      frameworkHints.push(hint);
    }
    if (ENTRY_POINT_PATTERNS.some((re) => re.test(base)) || base === "__main__.py") {
      entryPoints.push(item.path);
    }
  }

  const langs = Object.entries(languageBreakdown).sort((a, b) => b[1] - a[1]);
  const primaryLanguage = langs[0]?.[0] ?? "";
  const totalLangBytes = langs.reduce((s, [, n]) => s + n, 0);
  const topShare = totalLangBytes ? (langs[0]?.[1] ?? 0) / totalLangBytes : 0;
  const secondShare = totalLangBytes && langs[1] ? langs[1][1] / totalLangBytes : 0;

  let repoType: RepoType = "UNKNOWN";

  if (totalCode === 0 && blobs.length > 0) {
    const configLike = blobs.filter((f) => {
      const ext = f.path.includes(".") ? "." + f.path.split(".").pop()!.toLowerCase() : "";
      const name = pathSegments(f.path).pop()?.toLowerCase() || "";
      return CONFIG_EXTENSIONS.has(ext) || CONFIG_NAMES.has(name) || name.startsWith(".");
    });
    if (configLike.length >= Math.floor(blobs.length * 0.7)) {
      repoType = "INFRASTRUCTURE_ONLY";
    }
  } else if (ipynbCount >= 1 && totalCode <= 5 && pyCount + ipynbCount >= totalCode * 0.8) {
    repoType = "SINGLE_NOTEBOOK";
  } else if (ipynbCount >= 1 && (pyCount >= 1 || jsCount >= 1)) {
    repoType = "NOTEBOOK_WITH_SCRIPTS";
  } else if (pyCount >= 2 && ipynbCount === 0) {
    repoType = "PYTHON_PROJECT";
  } else if (jsCount >= 2 && ipynbCount === 0 && pyCount < 2) {
    repoType = "JAVASCRIPT_PROJECT";
  } else if (topShare < 0.7 && secondShare > 0.15 && totalCode >= 3) {
    repoType = "MULTI_LANGUAGE";
  } else if (repoType === "UNKNOWN" && primaryLanguage) {
    if (primaryLanguage === "Python" && pyCount >= 1) repoType = "PYTHON_PROJECT";
    else if (
      ["JavaScript", "TypeScript"].includes(primaryLanguage) &&
      jsCount >= 1
    )
      repoType = "JAVASCRIPT_PROJECT";
  }

  return {
    repoType,
    primaryLanguage,
    frameworkHints,
    entryPoints,
  };
}

// --- File role classification (Step 3) ---
function getExtension(path: string): string {
  const i = path.lastIndexOf(".");
  return i >= 0 ? path.slice(i).toLowerCase() : "";
}

function getBasename(path: string): string {
  const parts = path.replace(/^\/+/, "").split("/");
  return parts[parts.length - 1]?.toLowerCase() ?? "";
}

function roleFromPath(path: string, repoType: RepoType): FileRole {
  const ext = getExtension(path);
  const base = getBasename(path);
  const pathLower = path.toLowerCase();

  if (ext === ".ipynb") return "NOTEBOOK";
  if (ext === ".md" || ext === ".mdx" || ext === ".rst" || ext === ".txt") {
    return "DOCUMENTATION";
  }

  if (/^\.?config\.|\.config\./i.test(path) || base === "config.py" || base === "settings.py")
    return "CONFIG";
  if (/requirements.*\.txt$/i.test(base) || base === "setup.py" || base === "pyproject.toml")
    return "CONFIG";
  if (base === "package.json" || base === "package-lock.json" || base === "yarn.lock")
    return "CONFIG";
  if (base === "dockerfile" || base === "docker-compose.yml" || base === "docker-compose.yaml")
    return "INFRASTRUCTURE";
  if (/\.(yml|yaml)$/.test(ext) && (pathLower.includes("docker") || pathLower.includes("kube") || pathLower.includes("ci/")))
    return "INFRASTRUCTURE";

  if (/\/tests?\//.test(pathLower) || /^tests?\//.test(pathLower)) return "TEST";
  if (/^test_.*\.py$/i.test(base) || /_test\.(py|js|ts|jsx|tsx)$/i.test(base))
    return "TEST";
  if (base.startsWith("test") && (base.endsWith(".js") || base.endsWith(".ts")))
    return "TEST";

  if (/\/utils?\//.test(pathLower) || /^utils?\//.test(pathLower)) return "UTILITY";
  if (/\/lib(?:s|rary)?\//.test(pathLower) && !pathLower.includes("/models/"))
    return "UTILITY";

  if (/\/models?\//.test(pathLower) || /^models?\//.test(pathLower)) return "MODEL";
  if (/\/data\//.test(pathLower) || /^data\//.test(pathLower)) return "DATA_LAYER";
  if (/\/configs?\//.test(pathLower) || /^configs?\//.test(pathLower))
    return "CONFIG";

  if (ENTRY_POINT_PATTERNS.some((re) => re.test(base)) || base === "__main__.py") {
    return "ENTRY_POINT";
  }

  if (repoType === "PYTHON_PROJECT" || repoType === "NOTEBOOK_WITH_SCRIPTS") {
    if (/train(ing)?\.py$/i.test(base) || /fit\.py$/i.test(base)) return "TRAINING_PIPELINE";
    if (/eval(uation)?\.py$/i.test(base) || /evaluate\.py$/i.test(base))
      return "EVALUATION";
    if (/preprocess(ing)?\.py$/i.test(base) || /prep\.py$/i.test(base))
      return "PREPROCESSING";
  }

  if (CODE_EXTENSIONS.has(ext)) return "BUSINESS_LOGIC";
  return "UNKNOWN";
}

/**
 * Step 3: Classify each file in the tree with a role.
 */
export function classifyFiles(
  fileTree: FileTreeItem[],
  repoType: RepoType
): ClassifiedFile[] {
  return fileTree.map((item) => {
    const role =
      item.type === "tree"
        ? "UNKNOWN"
        : roleFromPath(item.path, repoType);
    const isNotebookPipeline =
      item.type === "blob" && role === "NOTEBOOK";
    return {
      ...item,
      role,
      ...(isNotebookPipeline ? { isNotebookPipeline: true } : {}),
    };
  });
}
