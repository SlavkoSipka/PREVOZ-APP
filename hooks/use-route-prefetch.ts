'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to prefetch routes in the background
 * Useful for improving perceived performance
 */
export function useRoutePrefetch(routes: string[]) {
  const router = useRouter()

  useEffect(() => {
    // Small delay to let the initial page load complete
    const timer = setTimeout(() => {
      routes.forEach(route => {
        router.prefetch(route)
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [routes, router])
}

