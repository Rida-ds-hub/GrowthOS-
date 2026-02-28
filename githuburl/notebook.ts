/**
 * Step 5: Notebook pipeline. Parse .ipynb JSON, classify cells, build cell dependency graph.
 */

import type { DepEdge } from "./dependencies";

export type CellRole =
  | "IMPORTS"
  | "DATA_LOADING"
  | "EDA"
  | "PREPROCESSING"
  | "FEATURE_ENGINEERING"
  | "MODEL_DEFINITION"
  | "TRAINING"
  | "EVALUATION"
  | "VISUALISATION"
  | "EXPLANATION"
  | "UTILITY";

export interface NotebookCellAnalysis {
  index: number;
  type: "code" | "markdown";
  role: CellRole;
  source?: string;
  imports?: string[];
  variableAssignments?: string[];
  definitions?: string[];
  hasOutputs?: boolean;
  markdownText?: string;
  dependsOnNonAdjacent?: boolean;
}

export interface NotebookDepNode {
  id: string;
  role: string;
  definitions: string[];
  inDegree: number;
  outDegree: number;
  centrality: boolean;
}

export interface NotebookDependencyGraph {
  nodes: NotebookDepNode[];
  edges: DepEdge[];
}

export interface NotebookAnalysisResult {
  dependencyGraph: NotebookDependencyGraph;
  narrative: string;
  cells: NotebookCellAnalysis[];
}

interface JupyterCell {
  cell_type: string;
  source?: string[] | string;
  outputs?: unknown[];
}

interface JupyterNotebook {
  cells?: JupyterCell[];
}

function getCellSource(cell: JupyterCell): string {
  const s = cell.source;
  if (Array.isArray(s)) return s.join("");
  return typeof s === "string" ? s : "";
}

function getCellRole(source: string, type: string): CellRole {
  if (type === "markdown") return "EXPLANATION";
  const lower = source.toLowerCase();
  if (/^(import |from .+ import )/m.test(source) && source.trim().split(/\n/).length < 8) return "IMPORTS";
  if (/\b(pd\.read_|read_csv|load_|open\(.*['\"]r?['\"]\)|\.read_|Dataset|DataLoader)/.test(lower)) return "DATA_LOADING";
  if (/\b(plt\.|sns\.|plot|hist|scatter|heatmap|visuali)/.test(lower)) return "VISUALISATION";
  if (/\b(train|fit\(|\.fit\(|epoch|optimizer|loss\.backward)/.test(lower)) return "TRAINING";
  if (/\b(evaluate|accuracy|metric|score|precision|recall|f1)/.test(lower)) return "EVALUATION";
  if (/\b(StandardScaler|MinMaxScaler|preprocess|encode|transform|normalize)/.test(lower)) return "PREPROCESSING";
  if (/\b(describe|head|info|value_counts|corr|eda|exploratory)/.test(lower)) return "EDA";
  if (/\b(FeatureUnion|Pipeline|feature_|select_|Vectorizer)/.test(lower)) return "FEATURE_ENGINEERING";
  if (/\b(class |def |Model|nn\.Module|Sequential)/.test(lower)) return "MODEL_DEFINITION";
  if (/\b(def |class |return |lambda )/.test(lower)) return "UTILITY";
  return "UTILITY";
}

function extractPythonImportsFromSource(source: string): string[] {
  const out: string[] = [];
  const fromRe = /^\s*from\s+([\w.]+)\s+import\s+/gm;
  const importRe = /^\s*import\s+([\w.]+)/gm;
  let m: RegExpExecArray | null;
  while ((m = fromRe.exec(source)) !== null) out.push(m[1]);
  while ((m = importRe.exec(source)) !== null) out.push(m[1]);
  return out;
}

function extractVariableAssignments(source: string): string[] {
  const out: string[] = [];
  const re = /^\s*(\w+)\s*=/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    const name = m[1];
    if (!["if", "elif", "else", "for", "while", "with", "def", "class", "import", "from"].includes(name)) {
      out.push(name);
    }
  }
  return out;
}

function extractDefinitions(source: string): string[] {
  const defs: string[] = [];
  const defRe = /^\s*def\s+(\w+)\s*\(/gm;
  const classRe = /^\s*class\s+(\w+)\s*(?:\(|:)/gm;
  let m: RegExpExecArray | null;
  while ((m = defRe.exec(source)) !== null) defs.push(m[1]);
  while ((m = classRe.exec(source)) !== null) defs.push(m[1]);
  return defs;
}

export function analyseNotebook(notebookContent: string): NotebookAnalysisResult {
  const nb = JSON.parse(notebookContent) as JupyterNotebook;
  const rawCells = nb.cells ?? [];
  const cells: NotebookCellAnalysis[] = [];
  const narrativeParts: string[] = [];
  const edges: DepEdge[] = [];
  const definedInCell = new Map<string, number>();
  const consumedInCell = new Map<string, number[]>();

  rawCells.forEach((cell, index) => {
    const type = cell.cell_type === "markdown" ? "markdown" : "code";
    const source = getCellSource(cell);
    const role = getCellRole(source, type);

    if (type === "markdown") {
      narrativeParts.push(source.trim());
      cells.push({
        index,
        type: "markdown",
        role: "EXPLANATION",
        markdownText: source.trim(),
      });
      return;
    }

    const imports = extractPythonImportsFromSource(source);
    const variableAssignments = extractVariableAssignments(source);
    const definitions = extractDefinitions(source);
    const hasOutputs = Array.isArray(cell.outputs) && cell.outputs.length > 0;

    variableAssignments.forEach((v) => {
      definedInCell.set(v, index);
    });
    definitions.forEach((d) => {
      definedInCell.set(d, index);
    });

    const tokens = source.replace(/[^\w.]/g, " ").split(/\s+/).filter(Boolean);
    const possibleRefs = new Set([...variableAssignments, ...definitions]);
    tokens.forEach((t) => {
      const name = t.split(".")[0];
      if (possibleRefs.has(name) && definedInCell.has(name)) {
        const defCell = definedInCell.get(name)!;
        if (!consumedInCell.has(name)) consumedInCell.set(name, []);
        consumedInCell.get(name)!.push(index);
        if (defCell !== index && !edges.some((e) => e.from === String(defCell) && e.to === String(index))) {
          edges.push({ from: String(defCell), to: String(index), type: "IMPORTS" });
        }
      }
    });

    cells.push({
      index,
      type: "code",
      role,
      source,
      imports: imports.length ? imports : undefined,
      variableAssignments: variableAssignments.length ? variableAssignments : undefined,
      definitions: definitions.length ? definitions : undefined,
      hasOutputs,
    });
  });

  consumedInCell.forEach((consumers, name) => {
    const defCell = definedInCell.get(name);
    if (defCell == null) return;
    consumers.forEach((c) => {
      if (c > defCell + 1) {
        const cellObj = cells.find((x) => x.index === c);
        if (cellObj) (cellObj as NotebookCellAnalysis & { dependsOnNonAdjacent?: boolean }).dependsOnNonAdjacent = true;
      }
    });
  });

  const nodeIds = new Set<string>();
  rawCells.forEach((_, i) => nodeIds.add(String(i)));
  edges.forEach((e) => {
    nodeIds.add(e.from);
    nodeIds.add(e.to);
  });

  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  nodeIds.forEach((id) => {
    inDegree.set(id, 0);
    outDegree.set(id, 0);
  });
  edges.forEach((e) => {
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
    outDegree.set(e.from, (outDegree.get(e.from) ?? 0) + 1);
  });

  const inValues = [...inDegree.values()].filter((n) => n > 0).sort((a, b) => b - a);
  const top10Threshold = inValues.length > 0 ? inValues[Math.min(Math.floor(inValues.length * 0.1), inValues.length - 1)] : 0;

  const nodes: NotebookDepNode[] = [];
  nodeIds.forEach((id) => {
    const idx = parseInt(id, 10);
    const cell = cells.find((c) => c.index === idx);
    nodes.push({
      id,
      role: cell?.role ?? "UTILITY",
      definitions: cell && "definitions" in cell && cell.definitions ? cell.definitions : [],
      inDegree: inDegree.get(id) ?? 0,
      outDegree: outDegree.get(id) ?? 0,
      centrality: (inDegree.get(id) ?? 0) >= top10Threshold && top10Threshold > 0,
    });
  });

  const dependencyGraph: NotebookDependencyGraph = { nodes, edges };

  return {
    dependencyGraph,
    narrative: narrativeParts.join("\n\n").trim(),
    cells,
  };
}
