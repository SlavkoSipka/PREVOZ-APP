import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  
  // Odjavi korisnika i obriši server-side sesiju
  await supabase.auth.signOut({ scope: 'global' })
  
  const response = NextResponse.json({ success: true })
  
  // Postavi cache headers da spreči keširanje
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

