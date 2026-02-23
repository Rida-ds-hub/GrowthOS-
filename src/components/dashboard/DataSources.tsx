"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, FileText, Globe, Check, X, ChevronDown, ChevronUp } from "lucide-react"

interface DataSource {
  type: "github" | "linkedin" | "resume" | "website"
  name: string
  status: "connected" | "available" | "not_provided"
  data?: string
  preview?: string
}

interface DataSourcesProps {
  githubData?: string | null
  linkedinData?: string | null
  resumeText?: string | null
  websiteUrl?: string | null
}

export function DataSources({ githubData, linkedinData, resumeText, websiteUrl }: DataSourcesProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpanded = (type: string) => {
    setExpanded((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  // Format GitHub data for display
  const formatGitHubPreview = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      const profile = parsed.profile || {}
      const repos = parsed.recentRepos || []
      const languages = parsed.languages || {}
      
      // Build detailed summary
      const profileInfo = [
        `Username: ${profile.username || 'N/A'}`,
        profile.bio ? `Bio: ${profile.bio}` : null,
        profile.location ? `Location: ${profile.location}` : null,
        profile.company ? `Company: ${profile.company}` : null,
        `Public Repos: ${profile.publicRepos || 0}`,
        profile.followers ? `Followers: ${profile.followers}` : null,
        profile.following ? `Following: ${profile.following}` : null,
      ].filter(Boolean).join('\n')
      
      const reposInfo = repos.length > 0 
        ? `\n\nRecent Repositories (${repos.length}):\n${repos.slice(0, 10).map((repo: any, idx: number) => 
            `${idx + 1}. ${repo.name}${repo.description ? ` - ${repo.description}` : ''}\n   ${repo.language || 'No language'} • ${repo.stargazers_count || 0} stars • ${repo.fork ? 'Fork' : 'Original'}`
          ).join('\n')}${repos.length > 10 ? `\n... and ${repos.length - 10} more repositories` : ''}`
        : ''
      
      const languagesInfo = Object.keys(languages).length > 0
        ? `\n\nTop Languages:\n${Object.entries(languages)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 10)
            .map(([lang, bytes]: [string, any]) => `  • ${lang}: ${bytes.toLocaleString()} bytes`)
            .join('\n')}`
        : ''
      
      return {
        summary: `${profile.publicRepos || 0} public repos, ${Object.keys(languages).length} languages, ${repos.length} recent repos analyzed`,
        details: profileInfo + reposInfo + languagesInfo
      }
    } catch {
      // If not JSON, show as text
      const lines = data.split('\n').filter(Boolean)
      return {
        summary: `${lines.length} lines of GitHub data extracted`,
        details: data.substring(0, 1000) + (data.length > 1000 ? '\n...' : '')
      }
    }
  }

  // Format LinkedIn data for display
  const formatLinkedInPreview = (data: string) => {
    const lines = data.split('\n').filter(Boolean)
    const firstFew = lines.slice(0, 5).join('\n')
    return {
      summary: `${lines.length} lines of profile data extracted`,
      details: firstFew + (lines.length > 5 ? '\n...' : '')
    }
  }

  // Format resume preview
  const formatResumePreview = (data: string) => {
    const preview = data.substring(0, 300).replace(/\n+/g, ' ').trim()
    return {
      summary: `${data.length.toLocaleString()} characters extracted`,
      details: preview + (data.length > 300 ? '...' : '')
    }
  }

  const sources: DataSource[] = [
    {
      type: "github",
      name: "GitHub",
      status: githubData ? "connected" : "not_provided",
      data: githubData || undefined,
      preview: githubData ? formatGitHubPreview(githubData).summary : undefined,
    },
    {
      type: "linkedin",
      name: "LinkedIn",
      status: linkedinData ? "connected" : "not_provided",
      data: linkedinData || undefined,
      preview: linkedinData ? formatLinkedInPreview(linkedinData).summary : undefined,
    },
    {
      type: "resume",
      name: "Resume",
      status: resumeText ? "connected" : "not_provided",
      data: resumeText || undefined,
      preview: resumeText ? formatResumePreview(resumeText).summary : undefined,
    },
    {
      type: "website",
      name: "Personal Website",
      status: websiteUrl ? "available" : "not_provided",
      data: websiteUrl || undefined,
      preview: websiteUrl ? `Website URL provided` : undefined,
    },
  ]

  const getIcon = (type: DataSource["type"]) => {
    switch (type) {
      case "github":
        return <Github className="w-5 h-5" />
      case "linkedin":
        return <Linkedin className="w-5 h-5" />
      case "resume":
        return <FileText className="w-5 h-5" />
      case "website":
        return <Globe className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: DataSource["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <Check className="w-3 h-3 mr-1" />
            Extracted
          </Badge>
        )
      case "available":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Check className="w-3 h-3 mr-1" />
            Provided
          </Badge>
        )
      case "not_provided":
        return (
          <Badge variant="outline" className="text-zinc-400 border-zinc-700">
            <X className="w-3 h-3 mr-1" />
            Not Provided
          </Badge>
        )
    }
  }

  const connectedCount = sources.filter((s) => s.status !== "not_provided").length

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Data Sources
          </CardTitle>
          <Badge variant="outline" className="text-zinc-300 border-zinc-700">
            {connectedCount} of {sources.length} connected
          </Badge>
        </div>
        <p className="text-sm text-zinc-400 mt-2">
          Sources used for your gap analysis. More sources = more accurate analysis.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source) => (
            <div
              key={source.type}
              className={`
                p-4 rounded-lg border transition-colors
                ${
                  source.status === "connected"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : source.status === "available"
                    ? "bg-blue-500/5 border-blue-500/20"
                    : "bg-zinc-950/50 border-zinc-800"
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      p-2 rounded-lg
                      ${
                        source.status === "connected"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : source.status === "available"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-zinc-800 text-zinc-500"
                      }
                    `}
                  >
                    {getIcon(source.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{source.name}</h3>
                  </div>
                </div>
                {getStatusBadge(source.status)}
              </div>
              
              {source.preview && (
                <div className="mt-3">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {source.preview}
                  </p>
                </div>
              )}
              
              {/* Expandable data preview */}
              {source.data && source.status !== "not_provided" && source.type !== "website" && (
                <div className="mt-3">
                  <button
                    onClick={() => toggleExpanded(source.type)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {expanded[source.type] ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Show details
                      </>
                    )}
                  </button>
                  
                  {expanded[source.type] && (
                    <div className="mt-2 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 max-h-[500px] overflow-y-auto">
                      {source.type === "github" && githubData ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2">GitHub Profile Data</h4>
                            <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                              {formatGitHubPreview(githubData).details}
                            </pre>
                          </div>
                          <div className="pt-3 border-t border-zinc-800">
                            <h4 className="text-sm font-semibold text-white mb-2">Raw Data</h4>
                            <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed max-h-[200px] overflow-y-auto">
                              {typeof githubData === 'string' ? githubData.substring(0, 2000) + (githubData.length > 2000 ? '\n... (truncated)' : '') : JSON.stringify(githubData, null, 2).substring(0, 2000)}
                            </pre>
                          </div>
                        </div>
                      ) : source.type === "linkedin" && linkedinData ? (
                        <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {formatLinkedInPreview(linkedinData).details}
                        </pre>
                      ) : source.type === "resume" && resumeText ? (
                        <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {formatResumePreview(resumeText).details}
                        </pre>
                      ) : (
                        <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {source.data}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {source.data && source.type === "website" && (
                <div className="mt-3">
                  <a
                    href={source.data}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Visit website →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
