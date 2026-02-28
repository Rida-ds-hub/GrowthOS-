/**
 * Step 4: Dependency extraction for non-notebook repos.
 * Parses Python and JS/TS imports, builds dependency graph with in/out degree and centrality.
 */

import type { FileRole } from "./classifier";
import type { RepoType } from "./classifier";

export interface DepNode {
  id: string;
  role: FileRole;
  definitions: string[];
  inDegree: number;
  outDegree: number;
  centrality: boolean;
}

export interface DepEdge {
  from: string;
  to: string;
  type: "IMPORTS";
}

export interface DependencyGraph {
  nodes: DepNode[];
  edges: DepEdge[];
}

const PYTHON_STDLIB = new Set([
  "abc", "argparse", "array", "ast", "asyncio", "base64", "bisect", "builtins",
  "bz2", "calendar", "cmath", "codecs", "collections", "concurrent", "configparser",
  "contextlib", "contextvars", "copy", "csv", "dataclasses", "datetime", "decimal",
  "difflib", "email", "encodings", "enum", "errno", "fnmatch", "fractions",
  "functools", "gc", "getopt", "getpass", "glob", "hashlib", "heapq", "hmac",
  "html", "http", "importlib", "inspect", "io", "ipaddress", "itertools", "json",
  "logging", "math", "mimetypes", "multiprocessing", "numbers", "operator", "os",
  "pathlib", "pickle", "platform", "pprint", "queue", "random", "re", "reprlib",
  "secrets", "selectors", "shutil", "signal", "socket", "socketserver", "sqlite3",
  "ssl", "stat", "statistics", "string", "struct", "subprocess", "sys", "tempfile",
  "threading", "time", "typing", "unittest", "urllib", "uuid", "warnings", "weakref",
  "xml", "zipfile", "zlib",
]);

export interface FileWithContent {
  path: string;
  content: string;
  role: FileRole;
}

function toModulePath(path: string, ext: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized.endsWith(ext)) {
    return normalized.slice(0, -ext.length).replace(/\//g, ".");
  }
  return normalized.replace(/\//g, ".");
}

function resolvePythonImport(
  spec: string,
  fromPath: string,
  allPaths: Set<string>
): string | null {
  const dir = fromPath.replace(/\/[^/]+$/, "") || ".";
  if (spec.startsWith(".")) {
    const base = (dir + "/" + spec.replace(/\./g, "/").replace(/^\.\//, "")).replace(/\/+/g, "/");
    if (allPaths.has(base + ".py")) return base + ".py";
    for (const p of allPaths) {
      if (p.startsWith(base + "/") && p.endsWith(".py")) return p;
    }
  } else {
    const asPath = spec.replace(/\./g, "/");
    if (allPaths.has(asPath + ".py")) return asPath + ".py";
    for (const p of allPaths) {
      if (!p.endsWith(".py")) continue;
      const mod = toModulePath(p, ".py");
      if (mod === spec || mod.endsWith("." + spec)) return p;
    }
  }
  return null;
}

function resolveJsImport(
  spec: string,
  fromPath: string,
  allPaths: Set<string>
): string | null {
  if (!spec.startsWith(".")) return null;
  const dir = fromPath.replace(/\/[^/]+$/, "") || ".";
  const base = (dir + "/" + spec.replace(/^\.\//, "")).replace(/\/+/g, "/");
  const candidates = [base, base + ".js", base + ".ts", base + ".tsx", base + ".jsx", base + "/index.js", base + "/index.ts"];
  for (const p of candidates) {
    if (allPaths.has(p)) return p;
  }
  return null;
}

function extractPythonDefinitions(source: string): string[] {
  const defs: string[] = [];
  const defRe = /^\s*def\s+(\w+)\s*\(/gm;
  const classRe = /^\s*class\s+(\w+)\s*(?:\(|:)/gm;
  let m: RegExpExecArray | null;
  while ((m = defRe.exec(source)) !== null) defs.push(m[1]);
  while ((m = classRe.exec(source)) !== null) defs.push(m[1]);
  return defs;
}

function extractPythonImports(source: string): string[] {
  const out: string[] = [];
  const importRe = /^\s*import\s+([\w.]+)/gm;
  const fromRe = /^\s*from\s+([\w.]+)\s+import\s+/gm;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(source)) !== null) out.push(m[1]);
  while ((m = fromRe.exec(source)) !== null) out.push(m[1]);
  return out;
}

function extractJsImports(source: string): string[] {
  const specs: string[] = [];
  const importRe = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const requireRe = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(source)) !== null) specs.push(m[1]);
  while ((m = requireRe.exec(source)) !== null) specs.push(m[1]);
  return specs;
}

function extractJsExports(source: string): string[] {
  const out: string[] = [];
  const exportRe = /export\s+(?:default\s+)?(?:function\s+(\w+)|const\s+(\w+)|class\s+(\w+)|async\s+function\s+(\w+))/g;
  let m: RegExpExecArray | null;
  while ((m = exportRe.exec(source)) !== null) {
    const name = m[1] || m[2] || m[3] || m[4];
    if (name) out.push(name);
  }
  return out;
}

export function extractDependencies(
  filesWithContent: FileWithContent[],
  repoType: RepoType,
  allBlobPaths: string[]
): DependencyGraph {
  const pathToRole = new Map<string, FileRole>();
  const pathToDefs = new Map<string, string[]>();
  for (const f of filesWithContent) {
    pathToRole.set(f.path, f.role);
  }
  const allPaths = new Set(allBlobPaths);
  const edges: DepEdge[] = [];
  const nodeIds = new Set<string>();

  const isPython =
    repoType === "PYTHON_PROJECT" || repoType === "NOTEBOOK_WITH_SCRIPTS";
  const isJs =
    repoType === "JAVASCRIPT_PROJECT" || repoType === "MULTI_LANGUAGE";

  for (const file of filesWithContent) {
    const { path, content, role } = file;
    nodeIds.add(path);

    if (isPython && path.endsWith(".py")) {
      pathToDefs.set(path, extractPythonDefinitions(content));
      const imports = extractPythonImports(content);
      for (const mod of imports) {
        const top = mod.split(".")[0];
        if (PYTHON_STDLIB.has(top)) continue;
        const resolved = resolvePythonImport(mod, path, allPaths);
        if (resolved) {
          edges.push({ from: path, to: resolved, type: "IMPORTS" });
          nodeIds.add(resolved);
        }
      }
    }

    if (isJs && /\.(js|ts|jsx|tsx|mjs|cjs)$/.test(path)) {
      const defs = extractJsExports(content);
      pathToDefs.set(path, defs.length ? defs : ["(exports)"]);
      const specs = extractJsImports(content);
      for (const spec of specs) {
        if (spec.startsWith(".")) {
          const resolved = resolveJsImport(spec, path, allPaths);
          if (resolved) {
            edges.push({ from: path, to: resolved, type: "IMPORTS" });
            nodeIds.add(resolved);
          }
        }
      }
    }
  }

  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  for (const id of nodeIds) {
    inDegree.set(id, 0);
    outDegree.set(id, 0);
  }
  for (const e of edges) {
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
    outDegree.set(e.from, (outDegree.get(e.from) ?? 0) + 1);
  }

  const inValues = [...inDegree.values()].filter((n) => n > 0).sort((a, b) => b - a);
  const top10Threshold =
    inValues.length > 0
      ? inValues[Math.min(Math.floor(inValues.length * 0.1), inValues.length - 1)]
      : 0;

  const nodes: DepNode[] = [];
  for (const id of nodeIds) {
    const inD = inDegree.get(id) ?? 0;
    nodes.push({
      id,
      role: pathToRole.get(id) ?? "UNKNOWN",
      definitions: pathToDefs.get(id) ?? [],
      inDegree: inD,
      outDegree: outDegree.get(id) ?? 0,
      centrality: inD >= top10Threshold && top10Threshold > 0,
    });
  }

  return { nodes, edges };
}
