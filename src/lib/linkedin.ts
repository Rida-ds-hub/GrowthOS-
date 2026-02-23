// LinkedIn profile data helpers
// This can be integrated with any LinkedIn scraping service (RapidAPI, Proxycurl, Reepl, etc.)

export interface LinkedInProfile {
  name?: string
  headline?: string
  summary?: string
  experience?: Array<{
    title: string
    company: string
    duration?: string
    description?: string
  }>
  education?: Array<{
    school: string
    degree?: string
    field?: string
  }>
  skills?: string[]
  certifications?: Array<{
    name: string
    issuer?: string
  }>
}

/**
 * Extract LinkedIn username/vanity from URL
 * Examples:
 * - https://www.linkedin.com/in/john-doe/ -> john-doe
 * - https://linkedin.com/in/jane-smith -> jane-smith
 */
export function extractLinkedInUsername(url: string): string | null {
  try {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/i)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Format LinkedIn profile data for AI analysis
 */
export function formatLinkedInData(profile: LinkedInProfile): string {
  const parts: string[] = []
  
  if (profile.name) parts.push(`Name: ${profile.name}`)
  if (profile.headline) parts.push(`Headline: ${profile.headline}`)
  if (profile.summary) parts.push(`Summary: ${profile.summary}`)
  
  if (profile.experience && profile.experience.length > 0) {
    parts.push('\nExperience:')
    profile.experience.forEach((exp, idx) => {
      parts.push(`${idx + 1}. ${exp.title} at ${exp.company}${exp.duration ? ` (${exp.duration})` : ''}`)
      if (exp.description) parts.push(`   ${exp.description}`)
    })
  }
  
  if (profile.education && profile.education.length > 0) {
    parts.push('\nEducation:')
    profile.education.forEach((edu) => {
      const eduStr = [edu.school, edu.degree, edu.field].filter(Boolean).join(' - ')
      parts.push(`- ${eduStr}`)
    })
  }
  
  if (profile.skills && profile.skills.length > 0) {
    parts.push(`\nSkills: ${profile.skills.join(', ')}`)
  }
  
  if (profile.certifications && profile.certifications.length > 0) {
    parts.push('\nCertifications:')
    profile.certifications.forEach((cert) => {
      parts.push(`- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ''}`)
    })
  }
  
  return parts.join('\n')
}
