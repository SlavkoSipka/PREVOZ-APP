/**
 * Route prefetching utilities
 * Preload routes before user navigates for instant page transitions
 */

export const prefetchRoute = (url: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'document'
    document.head.appendChild(link)
  }
}

export const prefetchRoutes = (urls: string[]) => {
  urls.forEach(prefetchRoute)
}

// Common routes to prefetch based on user role
export const VOZAC_ROUTES = [
  '/vozac',
  '/vozac/prijave',
  '/vozac/profil',
  '/vozac/notifikacije'
]

export const POSLODAVAC_ROUTES = [
  '/poslodavac',
  '/poslodavac/feed',
  '/poslodavac/objavi-turu',
  '/poslodavac/notifikacije'
]

export const ADMIN_ROUTES = [
  '/admin',
  '/admin/korisnici',
  '/admin/ture',
  '/admin/notifikacije'
]

