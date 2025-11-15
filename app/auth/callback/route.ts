import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Auth exchange error:', exchangeError)
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    let { data: profile } = await supabase
      .from('users')
      .select('uloga, profil_popunjen')
      .eq('id', user.id)
      .single()

    console.log('🔍 Auth callback - profil:', profile)

    // FORSIRANO: Ako profil ne postoji ili uloga je NULL → select-role
    if (!profile || profile.uloga === null || profile.uloga === undefined) {
      console.log('➡️ REDIRECT: /select-role (nema uloga)')
      
      // Kreiraj/update profil sa NULL uloga
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          uloga: null,
          puno_ime: user.user_metadata?.full_name || '',
          telefon: '',
          profil_popunjen: false,
        }, {
          onConflict: 'id'
        })
      
      return NextResponse.redirect(new URL('/select-role', request.url))
    }

    // Ako ima ulogu ali nije popunio profil → onboarding
    if (!profile.profil_popunjen) {
      const onboardingPath = profile.uloga === 'vozac' ? '/vozac-onboarding' : '/poslodavac-onboarding'
      console.log('➡️ REDIRECT:', onboardingPath, '(nije popunjen profil)')
      return NextResponse.redirect(new URL(onboardingPath, request.url))
    }

    // Ako je sve popunjeno → dashboard
    const dashboardPath = profile.uloga === 'admin' 
      ? '/admin' 
      : profile.uloga === 'vozac' 
      ? '/vozac' 
      : '/poslodavac'
    
    console.log('➡️ REDIRECT:', dashboardPath, '(sve popunjeno)')
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
}

