/**
 * Shared types and helpers for the githuburl repo analysis module.
 * All types used across fetcher, classifier, dependencies, etc.
 */

// --- Tree & fetch (Step 1) ---
export type FileTreeItemType = "blob" | "tree";

export interface FileTreeItem {
  path: string;
  type: FileTreeItemType;
  size?: number;
}

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  normalizedUrl: string;
}

/**
 * Parse a GitHub repo URL. Rejects gists, user profiles, blob/tree/raw links.
 */
export function parseGitHubRepoUrl(url: string): ParsedGitHubUrl {
  let normalized = url.trim();
  if (!normalized) {
    throw new Error("URL is required");
  }
  try {
    const u = new URL(normalized);
    if (u.hostname !== "github.com") {
      throw new Error("Not a github.com URL");
    }
    if (u.pathname.startsWith("/gist.") || u.pathname.includes("/gist/")) {
      throw new Error("Gist URLs are not supported");
    }
    const match = u.pathname.match(/^\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
    if (!match) {
      throw new Error(
        "Invalid repo URL: expected https://github.com/owner/repo (not blob/tree/user profile)"
      );
    }
    const [, owner, repo] = match;
    if (!owner || !repo || repo === "repos" || repo === "orgs") {
      throw new Error("Could not extract owner and repo from URL");
    }
    if (/^(blob|tree|raw|commit|commits|pull|issues)$/i.test(repo)) {
      throw new Error("URL appears to be a file or branch link, not a repo root");
    }
    normalized = `https://github.com/${owner}/${repo}`;
    return { owner, repo, normalizedUrl: normalized };
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Invalid repo URL")) throw e;
    if (e instanceof Error && e.message.startsWith("Not a github.com")) throw e;
    if (e instanceof Error && e.message.startsWith("Gist")) throw e;
    if (e instanceof Error && e.message.startsWith("Could not extract")) throw e;
    if (e instanceof Error && e.message.startsWith("URL appears")) throw e;
    throw new Error("Invalid GitHub URL");
  }
}

/** Max files we allow in a repo tree (hard limit). */
export const MAX_TREE_FILES = 10_000;

/** Max file size (bytes) to fetch content for dependency analysis. */
export const MAX_FILE_SIZE_FOR_CONTENT = 500 * 1024;

/** Max file size (bytes) to fetch for documentation (README / Markdown) files. */
export const MAX_DOC_FILE_SIZE = 500 * 1024;

/** Max number of documentation files (Markdown) to fetch per repo. */
export const MAX_DOC_FILES = 50;

/** Max file size (bytes) to fetch for .ipynb notebooks. Higher than code files to support large notebooks. */
const DEFAULT_MAX_NOTEBOOK_MB = 30;
const MIN_NOTEBOOK_MB = 1;
const MAX_NOTEBOOK_MB = 100;

function parseNotebookMb(): number {
  const raw = process.env.GITHUBURL_MAX_NOTEBOOK_MB;
  if (raw == null || raw === "") return DEFAULT_MAX_NOTEBOOK_MB;
  const n = parseInt(raw, 10);
  if (isNaN(n)) return DEFAULT_MAX_NOTEBOOK_MB;
  return Math.max(MIN_NOTEBOOK_MB, Math.min(MAX_NOTEBOOK_MB, n));
}

export const MAX_NOTEBOOK_FILE_SIZE = parseNotebookMb() * 1024 * 1024;
