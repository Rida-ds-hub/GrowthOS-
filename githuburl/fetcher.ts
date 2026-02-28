/**
 * Step 1: GitHub URL validation and repo fetch.
 * Validates URL, fetches repo metadata, languages, and full recursive file tree.
 */

import {
  type FileTreeItem,
  parseGitHubRepoUrl,
  MAX_TREE_FILES,
} from "./utils";

const GITHUB_API = "https://api.github.com";

export interface ValidateAndFetchRepoResult {
  owner: string;
  repo: string;
  repoName: string;
  repoUrl: string;
  description: string | null;
  defaultBranch: string;
  languageBreakdown: Record<string, number>;
  totalFileCount: number;
  fileTree: FileTreeItem[];
}

export class GitHubRepoError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "GitHubRepoError";
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function handleResponse(response: Response, context: string): void {
  if (response.status === 401) {
    throw new GitHubRepoError(
      "Private repo or invalid token (401). Set GITHUB_TOKEN for private repos.",
      401
    );
  }
  if (response.status === 404) {
    throw new GitHubRepoError("Repo not found (404).", 404);
  }
  if (response.status === 403) {
    const retryAfter = response.headers.get("Retry-After");
    const reset = response.headers.get("X-RateLimit-Reset");
    let retryAfterSeconds = 60;
    if (retryAfter) {
      const parsed = parseInt(retryAfter, 10);
      if (!isNaN(parsed)) retryAfterSeconds = parsed;
    } else if (reset) {
      const resetTime = parseInt(reset, 10);
      if (!isNaN(resetTime)) {
        retryAfterSeconds = Math.max(
          1,
          resetTime - Math.floor(Date.now() / 1000)
        );
      }
    }
    throw new GitHubRepoError(
      `GitHub rate limit exceeded (403). Try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
      403,
      retryAfterSeconds
    );
  }
  if (!response.ok) {
    throw new GitHubRepoError(
      `${context}: ${response.status} ${response.statusText}`,
      response.status
    );
  }
}

export async function validateAndFetchRepo(
  url: string
): Promise<ValidateAndFetchRepoResult> {
  const { owner, repo, normalizedUrl } = parseGitHubRepoUrl(url);

  const headers = getAuthHeaders();

  const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers,
  });
  handleResponse(repoRes, "Fetch repo");
  const repoData = (await repoRes.json()) as {
    name: string;
    description: string | null;
    default_branch: string;
    full_name: string;
  };

  const defaultBranch = repoData.default_branch || "main";

  const [langRes, commitsRes] = await Promise.all([
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, { headers }),
    fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(defaultBranch)}&per_page=1`,
      { headers }
    ),
  ]);
  handleResponse(langRes, "Fetch languages");
  handleResponse(commitsRes, "Fetch commits");

  const languageBreakdown = (await langRes.json()) as Record<string, number>;
  const commits = (await commitsRes.json()) as Array<{
    commit?: { tree?: { sha?: string } };
  }>;
  const treeSha =
    commits[0]?.commit?.tree?.sha;
  if (!treeSha) {
    throw new GitHubRepoError("Could not get tree SHA for default branch.");
  }

  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
    { headers }
  );
  handleResponse(treeRes, "Fetch tree");

  const treeData = (await treeRes.json()) as {
    tree?: Array<{ path?: string; type?: string; size?: number }>;
    truncated?: boolean;
  };

  if (treeData.truncated) {
    throw new GitHubRepoError(
      "Repo tree is too large (GitHub truncated the response)."
    );
  }

  const rawTree = treeData.tree || [];
  if (rawTree.length > MAX_TREE_FILES) {
    throw new GitHubRepoError(
      `Repo has more than ${MAX_TREE_FILES} files. Too large to process.`
    );
  }

  const fileTree: FileTreeItem[] = rawTree.map((item) => ({
    path: item.path || "",
    type: (item.type === "tree" ? "tree" : "blob") as FileTreeItem["type"],
    size: item.type === "blob" ? item.size : undefined,
  }));

  const totalFileCount = fileTree.filter((f) => f.type === "blob").length;

  return {
    owner,
    repo,
    repoName: repoData.full_name || repoData.name || repo,
    repoUrl: normalizedUrl,
    description: repoData.description ?? null,
    defaultBranch,
    languageBreakdown: languageBreakdown || {},
    totalFileCount,
    fileTree,
  };
}

/**
 * Fetch raw file content from repo. Returns null if too large, binary, or error.
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  defaultBranch: string,
  maxSize: number
): Promise<string | null> {
  const headers = getAuthHeaders();
  headers.Accept = "application/vnd.github.raw";
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(defaultBranch)}`,
    { headers }
  );
  if (!res.ok) return null;
  const contentLength = res.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxSize) return null;
  const text = await res.text();
  if (text.length > maxSize) return null;
  return text;
}
