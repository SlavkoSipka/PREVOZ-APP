'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ClearCacheOnMount() {
  const router = useRouter()

  useEffect(() => {
    // Proveri da li postoji flag za čišćenje keša
    if (typeof window !== 'undefined') {
      const shouldClear = sessionStorage.getItem('clearCache')
      
      if (shouldClear === 'true') {
        // Očisti flag
        sessionStorage.removeItem('clearCache')
        
        // Refresh router cache
        router.refresh()
      }
    }
  }, [router])

  return null
}

