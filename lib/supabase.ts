import { createClient } from '@supabase/supabase-js'

// Client-side supabase (uses anon key) — call only in browser or server components with env vars set
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Named export for convenience
export const supabase = getSupabaseClient()

// Server-side supabase (uses service role key)
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
  return createClient(supabaseUrl, serviceRoleKey)
}
