import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/'

  console.log('🔄 Auth callback hit:', { 
    hasCode: !!code, 
    error, 
    errorDescription,
    url: requestUrl.toString() 
  })

  // Ako ima error query param od OAuth providera
  if (error) {
    console.error('❌ OAuth provider error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/?error=auth_failed&details=${error}`, request.url))
  }

  if (code) {
    console.log('✅ Got authorization code, exchanging for session...')
    const supabase = await createServerSupabaseClient()
    
    // Retry logika za exchange (ponekad treba retry zbog code verifier timing-a)
    let sessionData, exchangeError
    let retries = 3
    
    while (retries > 0) {
      const result = await supabase.auth.exchangeCodeForSession(code)
      sessionData = result.data
      exchangeError = result.error
      
      if (!exchangeError) break
      
      // Ako je problem sa code verifier, probaj opet nakon kratkog delay-a
      if (exchangeError.message.includes('code verifier') || exchangeError.message.includes('auth code')) {
        retries--
        if (retries > 0) {
          console.log(`Retrying auth exchange... (${retries} attempts left)`)
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }
      }
      break
    }

    if (exchangeError) {
      console.error('Auth exchange error:', exchangeError.message, exchangeError)
      // User-friendly poruka
      const friendlyMessage = exchangeError.message.includes('code verifier') || exchangeError.message.includes('auth code')
        ? 'Session je istekla. Molimo pokušajte ponovo da se prijavite.'
        : exchangeError.message
      return NextResponse.redirect(new URL(`/?error=auth_failed&reason=${encodeURIComponent(friendlyMessage)}`, request.url))
    }

    if (!sessionData?.session) {
      console.error('No session after exchange')
      return NextResponse.redirect(new URL('/?error=no_session&reason=Sesija nije kreirana nakon autentifikacije', request.url))
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

