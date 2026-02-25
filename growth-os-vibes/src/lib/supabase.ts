import "server-only"
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client (uses service role key)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

// Validate URL format
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
let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseServiceKey && isValidUrl(supabaseUrl)) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    supabase = null
  }
} else {
  if (typeof window === 'undefined') {
    console.warn('Supabase credentials not configured. Database operations will not work until configured.')
  }
}

export { supabase }
