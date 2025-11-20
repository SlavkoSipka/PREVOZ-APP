import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
          let cookie = `${name}=${value}`
          if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`
          if (options?.path) cookie += `; Path=${options.path}`
          if (options?.domain) cookie += `; Domain=${options.domain}`
          if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`
          if (options?.secure) cookie += '; Secure'
          document.cookie = cookie
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; Max-Age=0; Path=${options?.path || '/'}`
        },
      },
    }
  )
}

