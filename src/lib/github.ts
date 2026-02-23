// GitHub REST API helpers

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
  const languages = repos
    .map(repo => repo.language)
    .filter(Boolean)
    .reduce((acc: Record<string, number>, lang) => {
      acc[lang] = (acc[lang] || 0) + 1
      return acc
    }, {})

  return JSON.stringify({
    profile: {
      username: profile.login,
      name: profile.name,
      bio: profile.bio,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      accountAge: new Date().getFullYear() - new Date(profile.created_at).getFullYear(),
    },
    recentRepos: repos.slice(0, 10).map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
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

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub repos for ${username}`)
  }

  return response.json()
}
