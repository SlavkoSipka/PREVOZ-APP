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

// Google OAuth je uklonjen iz aplikacije (20.11.2024)
// Koristi se samo Email/Password authentication

