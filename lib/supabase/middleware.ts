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

  // Edge-compatible: proveri samo da li ima Supabase auth token
  const accessToken = request.cookies.get('sb-access-token')?.value || 
                      request.cookies.get('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')?.value

  // Ako nema auth token, samo vrati response (gost korisnik)
  if (!accessToken) {
    return response
  }

  // Ako ima token, ali je na auth/select-role/onboarding stranicama, pusti ga
  const skipPaths = [
    '/auth/callback', 
    '/select-role', 
    '/registracija', 
    '/prijava',
    '/vozac-onboarding',
    '/poslodavac-onboarding',
    '/api/',
    '/_next/',
    '/favicon.ico'
  ]
  
  if (skipPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return response
  }

  // Za sve ostale zaštićene rute, pustiće ih Next.js da učita na server-side
  // gde će se uraditi provera sa Supabase-om (u layoutu ili page komponentama)
  return response
}

