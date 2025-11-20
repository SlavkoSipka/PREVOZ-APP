import { createClient } from '@/lib/supabase/client'
import { Uloga } from '@/types/database.types'

// Client-side auth helpers only
export async function signUp(
  email: string,
  password: string,
  userData: {
    puno_ime: string
    telefon: string
    uloga: Uloga | null
    naziv_firme?: string
    registarske_tablice?: string
  },
  redirectOptions?: { emailRedirectTo?: string }
) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: redirectOptions?.emailRedirectTo,
    },
  })

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  
  // Scope: global briše sve sesije (sve device-ove, sve tabove)
  const { error } = await supabase.auth.signOut({ scope: 'global' })
  
  // Očisti lokalno sve
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
    
    // Očisti Supabase cookie
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
  }
  
  return { error }
}

export async function signInWithGoogle() {
  const supabase = createClient()
  
  // OBAVEZNO: Koristi env varijablu (važno za Netlify production)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  
  console.log('🔐 Google OAuth redirect URL:', `${baseUrl}/auth/callback`)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
      queryParams: {
        prompt: 'select_account',
        access_type: 'offline',
      },
      skipBrowserRedirect: false,
    },
  })
  
  if (error) {
    console.error('❌ Google OAuth error:', error)
  } else {
    console.log('✅ Google OAuth initiated successfully')
  }
  
  return { data, error }
}

