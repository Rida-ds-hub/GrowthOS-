// GitHub REST API helpers

export class GitHubRateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterSeconds: number
  ) {
    super(message)
    this.name = "GitHubRateLimitError"
  }
}

export interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export async function fetchGitHubProfile(accessToken: string): Promise<GitHubProfile> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub profile')
  }

  return response.json()
}

export async function fetchGitHubRepos(accessToken: string): Promise<GitHubRepo[]> {
  const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub repos')
  }

  return response.json()
}

export function formatGitHubData(profile: GitHubProfile, repos: GitHubRepo[]): string {
  // Handle null/undefined values safely
  const safeRepos = repos || []
  
  const languages = safeRepos
    .map(repo => repo?.language)
    .filter(Boolean)
    .reduce((acc: Record<string, number>, lang) => {
      if (lang) {
        acc[lang] = (acc[lang] || 0) + 1
      }
      return acc
    }, {})

  // Calculate account age safely
  let accountAge = 0
  if (profile?.created_at) {
    try {
      accountAge = new Date().getFullYear() - new Date(profile.created_at).getFullYear()
    } catch {
      accountAge = 0
    }
  }

  return JSON.stringify({
    profile: {
      username: profile?.login || 'N/A',
      name: profile?.name || null,
      bio: profile?.bio || null,
      publicRepos: profile?.public_repos || 0,
      followers: profile?.followers || 0,
      following: profile?.following || 0,
      accountAge: accountAge,
      location: (profile as any)?.location || null,
      company: (profile as any)?.company || null,
      blog: (profile as any)?.blog || null,
    },
    recentRepos: safeRepos.slice(0, 10).map(repo => ({
      name: repo?.name || 'N/A',
      description: repo?.description || null,
      language: repo?.language || null,
      stars: repo?.stargazers_count || 0,
      forks: repo?.forks_count || 0,
      updated_at: repo?.updated_at || null,
    })),
    languages,
  }, null, 2)
}

// Fetch public GitHub profile by username (no auth required)
export async function fetchGitHubProfileByUsername(username: string): Promise<GitHubProfile> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (response.status === 403) {
    const reset = response.headers.get("X-RateLimit-Reset")
    const retryAfter = response.headers.get("Retry-After")
    let retryAfterSeconds = 60
    if (retryAfter) {
      const parsed = parseInt(retryAfter, 10)
      if (!isNaN(parsed)) retryAfterSeconds = parsed
    } else if (reset) {
      const resetTime = parseInt(reset, 10)
      if (!isNaN(resetTime)) {
        retryAfterSeconds = Math.max(1, resetTime - Math.floor(Date.now() / 1000))
      }
    }
    throw new GitHubRateLimitError(
      `GitHub rate limit exceeded. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
      retryAfterSeconds
    )
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub profile for ${username}`)
  }

  return response.json()
}

// Fetch public GitHub repos by username (no auth required)
export async function fetchGitHubReposByUsername(username: string): Promise<GitHubRepo[]> {
  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (response.status === 403) {
    const reset = response.headers.get("X-RateLimit-Reset")
    const retryAfter = response.headers.get("Retry-After")
    let retryAfterSeconds = 60
    if (retryAfter) {
      const parsed = parseInt(retryAfter, 10)
      if (!isNaN(parsed)) retryAfterSeconds = parsed
    } else if (reset) {
      const resetTime = parseInt(reset, 10)
      if (!isNaN(resetTime)) {
        retryAfterSeconds = Math.max(1, resetTime - Math.floor(Date.now() / 1000))
      }
    }
    throw new GitHubRateLimitError(
      `GitHub rate limit exceeded. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
      retryAfterSeconds
    )
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub repos for ${username}`)
  }

  return response.json()
}
