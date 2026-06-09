import { createClient } from '@supabase/supabase-js'

/* Single Supabase browser client for the app. Reads from app/.env (gitignored):
     VITE_SUPABASE_URL        https://<ref>.supabase.co
     VITE_SUPABASE_ANON_KEY   the publishable key (sb_publishable_…)
   The publishable key is safe for the browser — every table is guarded by RLS,
   and the private `documents` bucket only yields signed URLs to active members. */
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in app/.env (and in the Vercel project env).',
  )
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
