import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Uloga } from '@/types/database.types'

// Server-side auth helpers only
export async function getUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserWithProfile() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Ako profil ne postoji ili nema ulogu, vraćamo null
  if (!profile || !profile.uloga) {
    console.error('Profil korisnika ne postoji ili nema ulogu:', {
      userId: user.id,
      email: user.email,
      error
    })
    return null
  }

  return { user, profile }
}

export async function requireAuth(allowedRoles?: Uloga[]) {
  const userData = await getUserWithProfile()
  
  if (!userData) {
    return { error: 'Niste prijavljeni' }
  }

  if (allowedRoles && !allowedRoles.includes(userData.profile.uloga)) {
    return { error: 'Nemate pristup ovoj stranici' }
  }

  return { data: userData }
}

