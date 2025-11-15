// Service Worker za Push Notifikacije - TransLink
// Verzija: 1.0

const CACHE_NAME = 'translink-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Instaliran')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Aktiviran')
  event.waitUntil(self.clients.claim())
})

// Push event - Prima notifikacije
self.addEventListener('push', (event) => {
  console.log('📬 Push notifikacija primljena:', event)
  
  let notificationData = {
    title: 'TransLink',
    body: 'Imate novu notifikaciju',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'translink-notification',
    requireInteraction: false,
    data: {
      url: '/'
    }
  }

  // Parse podataka iz push event-a
  if (event.data) {
    try {
      const data = event.data.json()
      console.log('📦 Push data:', data)
      
      notificationData = {
        title: data.title || 'TransLink',
        body: data.body || data.message || 'Imate novu notifikaciju',
        icon: data.icon || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: data.tag || 'translink-notification',
        requireInteraction: data.requireInteraction || false,
        data: {
          url: data.url || data.link || '/',
          notificationId: data.notificationId,
          ...data.data
        },
        actions: data.actions || []
      }
    } catch (error) {
      console.error('❌ Error parsing push data:', error)
    }
  }

  // Prikaži notifikaciju
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: [200, 100, 200], // Vibracija
      silent: false
    })
  )
})

// Notification click event - Kada korisnik klikne na notifikaciju
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event)
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  // Otvori stranicu
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Ako već ima otvoren tab sa TransLink-om, fokusiraj ga
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            url: urlToOpen,
            notificationData: event.notification.data
          })
          return client
        }
      }
      
      // Ako nema otvorenog tab-a, otvori novi
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background sync (optional - za offline support)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event)
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  // Implementacija sync logike ako je potrebno
  console.log('🔄 Syncing notifications...')
}

