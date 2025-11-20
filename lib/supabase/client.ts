import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Eksplicitno koristi localStorage za PKCE flow
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Eksplicitno postavi flowType na pkce
        flowType: 'pkce',
        // Poveži se na OAuth provajdera sa boljim error handling-om
        detectSessionInUrl: true,
        // Produženi timeout za sporije konekcije
        storageKey: 'sb-auth-token',
      },
      global: {
        headers: {
          'X-Client-Info': 'translink-web',
        },
      },
    }
  )
}

