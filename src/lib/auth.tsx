import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'

/* Real Supabase Auth. Mirrors the DB profiles row (role + status) that RLS
   enforces server-side: owner → owner+active; approved-domain signup → member+
   pending (awaits owner approval); anything else is rejected by the
   handle_new_user trigger. `isActiveMember` is the client analogue of the
   storage read policy that gates downloads. */
export type Role = 'owner' | 'member'
export type Status = 'pending' | 'active'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  status: Status
}

interface AuthResult {
  error: string | null
}
interface SignUpResult {
  error: string | null
  needsConfirmation: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isOwner: boolean
  isActiveMember: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  role: Role
  status: Status
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProfile(uid: string, fallbackEmail: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,full_name,role,status')
        .eq('id', uid)
        .maybeSingle()
      if (!active) return
      if (error || !data) {
        // Signed in but no profile (e.g. a signup the trigger rejected) — treat as guest.
        setUser(null)
      } else {
        const p = data as ProfileRow
        const email = p.email || fallbackEmail
        setUser({
          id: p.id,
          email,
          name: p.full_name?.trim() || email.split('@')[0],
          role: p.role,
          status: p.status,
        })
      }
      setLoading(false)
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session?.user) void loadProfile(session.user.id, session.user.email ?? '')
      else {
        setUser(null)
        setLoading(false)
      }
    })

    // Note: the callback stays sync and fires loadProfile without awaiting it
    // (awaiting a supabase call inside onAuthStateChange can deadlock).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user) {
        setLoading(true)
        void loadProfile(session.user.id, session.user.email ?? '')
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return { error: error?.message ?? null }
  }

  const signUp = async (name: string, email: string, password: string): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    })
    if (error) return { error: error.message, needsConfirmation: false }
    // With email confirmation on, a user is returned but no session yet.
    return { error: null, needsConfirmation: !!data.user && !data.session }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const resetPassword = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    })
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOwner: user?.role === 'owner',
        isActiveMember: !!user && (user.role === 'owner' || user.status === 'active'),
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
