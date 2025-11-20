import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Detect if running on mobile for better cookie handling
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Produženi session lifetime za mobile (7 dana)
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Mobile-friendly storage
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return null
          const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : null
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return
          
          // Mobile-optimized cookie settings
          let cookie = `${name}=${value}`
          
          // Max-Age: 7 dana za mobile persistence
          const maxAge = options?.maxAge || (isMobile ? 604800 : 3600)
          cookie += `; Max-Age=${maxAge}`
          
          // Path
          cookie += `; Path=${options?.path || '/'}`
          
          // SameSite: Lax je najbolji za mobile Chrome
          const sameSite = options?.sameSite || 'Lax'
          cookie += `; SameSite=${sameSite}`
          
          // Secure: Samo ako je HTTPS
          if (window.location.protocol === 'https:' || options?.secure) {
            cookie += '; Secure'
          }
          
          document.cookie = cookie
          console.log('🍪 Cookie set:', name, '| MaxAge:', maxAge, '| Mobile:', isMobile)
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return
          const path = options?.path || '/'
          document.cookie = `${name}=; Max-Age=0; Path=${path}; SameSite=Lax`
          console.log('🗑️ Cookie removed:', name)
        },
      },
    }
  )
}

