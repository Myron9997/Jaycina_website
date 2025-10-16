import { createClient } from '@supabase/supabase-js'

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  if (!url || !serviceKey) {
    throw new Error('Supabase not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, serviceKey)
}
