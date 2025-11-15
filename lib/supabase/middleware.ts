import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Dodaj aggressive no-cache headers za sve stranice (posebno za auth)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  
  // Dodatno za auth i onboarding stranice
  if (
    request.nextUrl.pathname.startsWith('/prijava') ||
    request.nextUrl.pathname.startsWith('/registracija') ||
    request.nextUrl.pathname.startsWith('/auth/') ||
    request.nextUrl.pathname.startsWith('/vozac-onboarding') ||
    request.nextUrl.pathname.startsWith('/poslodavac-onboarding')
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Skip middleware za auth callback, select-role, registraciju I ONBOARDING stranice
    const skipPaths = [
      '/auth/callback', 
      '/select-role', 
      '/registracija', 
      '/prijava',
      '/vozac-onboarding',      // ✅ Dozvoli pristup čak i sa uloga=null
      '/poslodavac-onboarding'  // ✅ Dozvoli pristup čak i sa uloga=null
    ]
    if (skipPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      console.log('✅ MIDDLEWARE: Skipping check for:', request.nextUrl.pathname)
      return response
    }

    // Učitaj podatke iz public.users
    const { data: userData } = await supabase
      .from('users')
      .select('uloga, blokiran, profil_popunjen')
      .eq('id', user.id)
      .single()

    console.log('🔧 MIDDLEWARE CHECK:', request.nextUrl.pathname)
    console.log('🔧 User data:', userData)

    if (userData) {
      const uloga = userData.uloga
      const profil_popunjen = userData.profil_popunjen

      // PRIORITET 1: Ako nema ulogu, OBAVEZNO na select-role
      if (!uloga || uloga === null) {
        console.log('🔧 MIDDLEWARE REDIRECT → /select-role (uloga je null)')
        return NextResponse.redirect(new URL('/select-role', request.url))
      }

      // Provera da li poslodavac mora da popuni profil
      if (uloga === 'poslodavac' && !profil_popunjen) {
        const allowedPaths = [
          '/poslodavac-onboarding',
          '/auth/callback',
          '/select-role',
          '/registracija'
        ]
        
        const isAllowed = allowedPaths.some(path => 
          request.nextUrl.pathname.startsWith(path)
        )
        
        if (!isAllowed) {
          return NextResponse.redirect(new URL('/poslodavac-onboarding', request.url))
        }
      }

      // Provera da li vozač mora da popuni profil
      if (uloga === 'vozac' && !profil_popunjen) {
        const allowedPaths = [
          '/vozac-onboarding',
          '/auth/callback',
          '/select-role',
          '/registracija'
        ]
        
        const isAllowed = allowedPaths.some(path => 
          request.nextUrl.pathname.startsWith(path)
        )
        
        if (!isAllowed) {
          return NextResponse.redirect(new URL('/vozac-onboarding', request.url))
        }
      }

      // Zaštita admin ruta
      if (request.nextUrl.pathname.startsWith('/admin') && uloga !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Zaštita vozač ruta
      if (request.nextUrl.pathname.startsWith('/vozac') && uloga !== 'vozac') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Zaštita poslodavac ruta
      if (request.nextUrl.pathname.startsWith('/poslodavac') && uloga !== 'poslodavac') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Provera blokiranih naloga (izuzimamo API rute)
      if (userData.blokiran && 
          !request.nextUrl.pathname.startsWith('/uplata-obavezna') &&
          !request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/uplata-obavezna', request.url))
      }
    }
  }

  return response
}

