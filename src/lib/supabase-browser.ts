import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Browser-side Supabase client (uses anon key)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

// Validate URL format - must be a valid HTTP/HTTPS URL
const isValidUrl = (url: string): boolean => {
  if (!url || url.length === 0) return false
  try {
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.length > 0
  } catch {
    return false
  }
}

// Only create client if we have valid credentials
// If credentials are missing, set to null and handle gracefully in components
const hasValidCredentials = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)

let supabaseBrowser: SupabaseClient | null = null

if (hasValidCredentials) {
  try {
    supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    supabaseBrowser = null
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('Supabase credentials not configured. Email authentication will not work until configured.')
  }
}

export { supabaseBrowser }
