/**
 * Helper funkcije za kreiranje notifikacija i automatsko slanje push notifikacija
 */

import { createClient } from '@/lib/supabase/client'

export interface CreateNotificationOptions {
  userId: string
  tip: 'odobreno' | 'odbijeno' | 'nova_ocena' | 'uplata_potrebna' | 'admin_poruka' | 'tura_odobrena' | 'vozac_dodeljen' | 'tura_zavrsena'
  poruka: string
  turaId?: string
  prijavaId?: string
}

/**
 * Kreira notifikaciju u bazi I automatski šalje push notifikaciju
 */
export async function createNotificationWithPush(options: CreateNotificationOptions): Promise<boolean> {
  try {
    const supabase = createClient()

    // 1. Kreiraj notifikaciju u bazi
    const { data: notifikacija, error: notifError } = await supabase
      .from('notifikacije')
      .insert({
        vozac_id: options.userId,
        tip: options.tip,
        poruka: options.poruka,
        tura_id: options.turaId || null,
        prijava_id: options.prijavaId || null,
        procitano: false
      })
      .select()
      .single()

    if (notifError) {
      console.error('❌ Greška pri kreiranju notifikacije:', notifError)
      return false
    }

    console.log('✅ Notifikacija kreirana:', notifikacija)

    // 2. Pošalji push notifikaciju
    await sendPushForNotification(options.userId, options.tip, options.poruka, options.turaId)

    return true
  } catch (error) {
    console.error('❌ Error u createNotificationWithPush:', error)
    return false
  }
}

/**
 * Pošalje push notifikaciju za datu notifikaciju
 */
async function sendPushForNotification(
  userId: string,
  tip: string,
  poruka: string,
  turaId?: string
) {
  try {
    // Generiši naslov na osnovu tipa
    const title = getTitleForNotificationType(tip)
    
    // Generiši URL na osnovu tipa
    const url = getUrlForNotificationType(tip, turaId)

    // Pošalji push notifikaciju
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body: poruka,
        url,
        icon: '/icon-192x192.png',
        requireInteraction: false,
        tag: `notification-${tip}`,
        data: {
          type: tip,
          turaId
        }
      })
    })

    if (response.ok) {
      console.log('✅ Push notifikacija poslata za:', userId)
    } else {
      const error = await response.json()
      console.log('ℹ️ Push notification nije poslat (korisnik možda nije omogućio):', error.message)
    }
  } catch (error) {
    console.error('❌ Error slanja push notifikacije:', error)
  }
}

/**
 * Generiši naslov na osnovu tipa notifikacije
 */
function getTitleForNotificationType(tip: string): string {
  switch (tip) {
    case 'odobreno':
      return '✅ Prijava odobrena'
    case 'odbijeno':
      return '❌ Prijava odbijena'
    case 'nova_ocena':
      return '⭐ Nova ocena'
    case 'uplata_potrebna':
      return '💰 Potrebna uplata provizije'
    case 'admin_poruka':
      return '📬 Poruka od administratora'
    case 'tura_odobrena':
      return '✅ Tura odobrena'
    case 'vozac_dodeljen':
      return '🚚 Vozač dodeljen'
    case 'tura_zavrsena':
      return '🎉 Tura završena'
    default:
      return '🔔 Nova notifikacija'
  }
}

/**
 * Generiši URL na osnovu tipa notifikacije
 */
function getUrlForNotificationType(tip: string, turaId?: string): string {
  // Za sve notifikacije, vodi ka stranici sa notifikacijama
  // Korisnik će tamo videti detaljnije informacije
  
  if (tip === 'odobreno' || tip === 'odbijeno') {
    return '/vozac/notifikacije'
  }
  
  if (tip === 'tura_odobrena' || tip === 'vozac_dodeljen' || tip === 'tura_zavrsena') {
    return '/poslodavac/notifikacije'
  }
  
  if (tip === 'nova_ocena') {
    return '/vozac/notifikacije'
  }
  
  if (tip === 'admin_poruka') {
    // Idi na notifikacije u zavisnosti od uloge (biće detektovano na strani korisnika)
    return '/notifikacije'
  }
  
  return '/'
}

/**
 * SERVER-SIDE verzija - za korišćenje u API route-ovima
 */
export async function createNotificationWithPushServer(
  options: CreateNotificationOptions,
  supabaseClient: any
): Promise<boolean> {
  try {
    // 1. Kreiraj notifikaciju u bazi
    const { data: notifikacija, error: notifError } = await supabaseClient
      .from('notifikacije')
      .insert({
        vozac_id: options.userId,
        tip: options.tip,
        poruka: options.poruka,
        tura_id: options.turaId || null,
        prijava_id: options.prijavaId || null,
        procitano: false
      })
      .select()
      .single()

    if (notifError) {
      console.error('❌ Greška pri kreiranju notifikacije:', notifError)
      return false
    }

    console.log('✅ Notifikacija kreirana:', notifikacija)

    // 2. Pošalji push notifikaciju (pozovi API direktno server-side)
    const title = getTitleForNotificationType(options.tip)
    const url = getUrlForNotificationType(options.tip, options.turaId)

    // Učitaj push subscription
    const { data: subData } = await supabaseClient
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', options.userId)
      .single()

    if (subData?.subscription) {
      // Pošalji push koristeći web-push direktno
      // Koristi env variable ili dinamički URL
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      
      try {
        await fetch(`${baseUrl}/api/push/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: options.userId,
            title,
            body: options.poruka,
            url,
            icon: '/icon-192x192.png',
            tag: `notification-${options.tip}`,
            data: {
              type: options.tip,
              turaId: options.turaId
            }
          })
        })
        
        console.log('✅ Push notifikacija poslata (server-side) za:', options.userId)
      } catch (pushError) {
        console.log('ℹ️ Push notification nije poslat:', pushError)
      }
    }

    return true
  } catch (error) {
    console.error('❌ Error u createNotificationWithPushServer:', error)
    return false
  }
}

