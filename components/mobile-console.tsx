'use client'

import { useEffect } from 'react'

/**
 * Mobile Console - Prikazuje console na telefonu za debug
 * Koristiti samo za development!
 */
export function MobileConsole() {
  useEffect(() => {
    // Učitaj Eruda samo na mobilu i samo u non-production
    if (typeof window !== 'undefined') {
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      
      // Aktiviraj samo ako je u URL-u ?debug=true ili ako je localhost
      const isDebugMode = window.location.search.includes('debug=true') || window.location.hostname === 'localhost'
      
      if (isMobile && isDebugMode) {
        // Dinamički učitaj Eruda
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/eruda'
        script.onload = () => {
          // @ts-ignore
          if (window.eruda) {
            // @ts-ignore
            window.eruda.init()
            console.log('📱 Mobile Console aktiviran! Klikni na ikonicu u donjem desnom uglu.')
          }
        }
        document.body.appendChild(script)
      }
    }
  }, [])

  return null
}

