// Helper funkcije za slanje push notifikacija

export interface SendPushOptions {
  userId: string
  title: string
  body: string
  url?: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
  data?: any
}

/**
 * Pošalji push notifikaciju korisniku
 * Ova funkcija poziva server API endpoint koji šalje push
 */
export async function sendPushNotification(options: SendPushOptions): Promise<boolean> {
  try {
    console.log('📤 Slanje push notifikacije:', options)

    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Push notification error:', error)
      return false
    }

    const result = await response.json()
    console.log('✅ Push notification sent:', result)
    return true

  } catch (error) {
    console.error('❌ Error sending push notification:', error)
    return false
  }
}

/**
 * Pošalji push notifikaciju za novu turu
 */
export async function notifyNewTour(userId: string, tourData: {
  polazak: string
  destinacija: string
  ponudjena_cena: number
  turaId: string
}) {
  return sendPushNotification({
    userId,
    title: '🚚 Nova tura dostupna!',
    body: `${tourData.polazak} → ${tourData.destinacija} | ${tourData.ponudjena_cena}€`,
    url: `/vozac/ture/${tourData.turaId}`,
    tag: `new-tour-${tourData.turaId}`,
    data: {
      type: 'new_tour',
      turaId: tourData.turaId
    }
  })
}

/**
 * Pošalji push notifikaciju za odobrenu prijavu
 */
export async function notifyApplicationApproved(userId: string, tourData: {
  polazak: string
  destinacija: string
  turaId: string
}) {
  return sendPushNotification({
    userId,
    title: '✅ Prijava odobrena!',
    body: `Vaša prijava za turu ${tourData.polazak} → ${tourData.destinacija} je odobrena!`,
    url: `/vozac/ture/${tourData.turaId}`,
    tag: `application-approved-${tourData.turaId}`,
    requireInteraction: true,
    data: {
      type: 'application_approved',
      turaId: tourData.turaId
    }
  })
}

/**
 * Pošalji push notifikaciju za odbijenu prijavu
 */
export async function notifyApplicationRejected(userId: string, tourData: {
  polazak: string
  destinacija: string
  razlog?: string
}) {
  return sendPushNotification({
    userId,
    title: '❌ Prijava odbijena',
    body: tourData.razlog || `Vaša prijava za turu ${tourData.polazak} → ${tourData.destinacija} je odbijena.`,
    url: '/vozac/prijave',
    tag: 'application-rejected',
    data: {
      type: 'application_rejected'
    }
  })
}

/**
 * Pošalji push notifikaciju za admin poruku
 */
export async function notifyAdminMessage(userId: string, message: string) {
  return sendPushNotification({
    userId,
    title: '📬 Poruka od administratora',
    body: message,
    url: '/vozac/notifikacije',
    tag: 'admin-message',
    requireInteraction: true,
    data: {
      type: 'admin_message'
    }
  })
}

/**
 * Pošalji push notifikaciju za dodeljenog vozača (poslodavcu)
 */
export async function notifyDriverAssigned(userId: string, tourData: {
  polazak: string
  destinacija: string
  vozacIme: string
  turaId: string
}) {
  return sendPushNotification({
    userId,
    title: '👤 Vozač dodeljen!',
    body: `${tourData.vozacIme} je dodeljen za turu ${tourData.polazak} → ${tourData.destinacija}`,
    url: `/poslodavac/ture/${tourData.turaId}`,
    tag: `driver-assigned-${tourData.turaId}`,
    requireInteraction: true,
    data: {
      type: 'driver_assigned',
      turaId: tourData.turaId
    }
  })
}

/**
 * Pošalji push notifikaciju za završenu turu (poslodavcu)
 */
export async function notifyTourFinished(userId: string, tourData: {
  polazak: string
  destinacija: string
  turaId: string
}) {
  return sendPushNotification({
    userId,
    title: '✅ Tura završena!',
    body: `Tura ${tourData.polazak} → ${tourData.destinacija} je završena. Ocenite vozača!`,
    url: `/poslodavac/ture/${tourData.turaId}`,
    tag: `tour-finished-${tourData.turaId}`,
    requireInteraction: true,
    data: {
      type: 'tour_finished',
      turaId: tourData.turaId
    }
  })
}

/**
 * Pošalji push notifikaciju za potrebnu uplatu
 */
export async function notifyPaymentRequired(userId: string, amount: number) {
  return sendPushNotification({
    userId,
    title: '💳 Potrebna uplata',
    body: `Potrebno je da platite proviziju od ${amount}€`,
    url: '/uplata-obavezna',
    tag: 'payment-required',
    requireInteraction: true,
    data: {
      type: 'payment_required',
      amount
    }
  })
}

/**
 * Pošalji push notifikaciju za novu ocenu (vozaču)
 */
export async function notifyNewRating(userId: string, rating: number, poslodavacIme: string) {
  const stars = '⭐'.repeat(rating)
  return sendPushNotification({
    userId,
    title: '🌟 Nova ocena!',
    body: `${poslodavacIme} vas je ocenio sa ${stars} (${rating}/5)`,
    url: '/vozac/profil',
    tag: 'new-rating',
    data: {
      type: 'new_rating',
      rating
    }
  })
}

