import { supabase } from '@/lib/supabaseClient'

/* Public lead capture: write a visitor's email + light, analysis-friendly
   metadata into the anon-writable `leads` table (owner-only read under RLS).
   The matching server-side shape rules live in the 0108_leads migration. */

export interface LeadInput {
  email: string
  name: string
  interest: string
}
export type LeadOutcome = 'ok' | 'error'

export async function submitLead(input: LeadInput): Promise<LeadOutcome> {
  const email = input.email.trim().toLowerCase()
  const { error } = await supabase.from('leads').insert({
    email,
    full_name: input.name.trim() || null,
    interest: input.interest || null,
    source_path: window.location.pathname.slice(0, 200),
    referrer: (document.referrer || '').slice(0, 400) || null,
    lang: (localStorage.getItem('kp-lang') || 'ar').slice(0, 8),
    user_agent: navigator.userAgent.slice(0, 400),
  })
  if (error) {
    // 23505 = unique_violation: this address is already on the list — that's a
    // success from the visitor's point of view, not an error.
    if (error.code === '23505') return 'ok'
    return 'error'
  }
  return 'ok'
}
