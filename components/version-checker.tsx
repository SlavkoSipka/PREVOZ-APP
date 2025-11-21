'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Version Checker Component
 * Detektuje kada je nova verzija aplikacije deploy-ovana i automatski refresh-uje stranicu
 */
export function VersionChecker() {
  const router = useRouter()

  useEffect(() => {
    // Sačuvaj trenutni build ID u localStorage
    const BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_ID || Date.now().toString()
    const STORED_VERSION = typeof window !== 'undefined' ? localStorage.getItem('app_version') : null

    if (STORED_VERSION && STORED_VERSION !== BUILD_VERSION) {
      console.log('🔄 Nova verzija detektovana! Čišćenje cache-a...')
      
      // Očisti sve cache-ove
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name)
          })
        })
      }

      // Sačuvaj novu verziju
      localStorage.setItem('app_version', BUILD_VERSION)
      
      // Hard reload nakon 500ms
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } else if (!STORED_VERSION) {
      // Prvi put - sačuvaj verziju
      localStorage.setItem('app_version', BUILD_VERSION)
    }

    // Proveri za novu verziju svakih 5 minuta
    const checkInterval = setInterval(async () => {
      try {
        // Pokušaj da učitaš /api/version ili jednostavno proveri da li postoje novi bundlovi
        const response = await fetch('/_next/static/chunks/main-app.js', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
        
        if (!response.ok) {
          // Novi build - stari fajlovi ne postoje više
          console.log('🔄 Detektovan novi deploy! Refresh-ovanje...')
          localStorage.setItem('needs_reload', 'true')
          
          // Ako je korisnik na login/register stranici, odmah refresh
          if (window.location.pathname === '/prijava' || 
              window.location.pathname === '/registracija' ||
              window.location.pathname === '/') {
            window.location.reload()
          } else {
            // Inače, sačekaj da završi trenutnu akciju
            setTimeout(() => {
              if (localStorage.getItem('needs_reload') === 'true') {
                window.location.reload()
              }
            }, 3000)
          }
        }
      } catch (error) {
        // Ignore errors - mogu biti network problemi
      }
    }, 5 * 60 * 1000) // 5 minuta

    return () => clearInterval(checkInterval)
  }, [router])

  // Proveri odmah ako postoji flag za reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const needsReload = localStorage.getItem('needs_reload')
      if (needsReload === 'true') {
        localStorage.removeItem('needs_reload')
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    }
  }, [])

  return null
}

