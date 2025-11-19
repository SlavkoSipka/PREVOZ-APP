import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Konfiguriši VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:noreply@translink.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidEmail,
    vapidPublicKey,
    vapidPrivateKey
  )
}

export interface PushNotificationPayload {
  userId: string
  title: string
  body: string
  url?: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
  data?: any
}

export async function POST(request: NextRequest) {
  try {
    // Proveri autentifikaciju
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Samo autentifikovani admin korisnici ili server mogu slati notifikacije
    // Za sada, dozvoljavamo sve autentifikovane zahteve
    // U produkciji, dodaj proveru za API key ili admin role
    
    const payload: PushNotificationPayload = await request.json()
    
    if (!payload.userId || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'userId, title i body su obavezni' },
        { status: 400 }
      )
    }

    // Učitaj push subscription za korisnika
    console.log('🔍 Tražim push subscription za korisnika:', payload.userId)
    
    const { data: subscriptionData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', payload.userId)
      .single()

    if (subError || !subscriptionData) {
      console.log('❌ Korisnik nema push subscription:', payload.userId)
      console.log('   Error:', subError?.message || 'No data')
      return NextResponse.json(
        { message: 'Korisnik nema omogućene push notifikacije', error: subError?.message },
        { status: 200 } // Ne vraćamo error jer ovo nije greška
      )
    }
    
    console.log('✅ Subscription pronađen za:', payload.userId)

    const pushSubscription = subscriptionData.subscription

    // Pripremi push notification payload
    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: payload.tag || 'translink-notification',
      url: payload.url || '/',
      requireInteraction: payload.requireInteraction || false,
      data: payload.data || {},
      actions: []
    }

    // Pošalji push notifikaciju
    try {
      await webpush.sendNotification(
        pushSubscription as any,
        JSON.stringify(notificationPayload),
        {
          TTL: 3600, // Time to live (1 sat)
        }
      )

      console.log('✅ Push notifikacija poslata:', payload.userId)
      
      return NextResponse.json({
        success: true,
        message: 'Push notifikacija uspešno poslata'
      })
    } catch (pushError: any) {
      console.error('❌ Error sending push notification:', pushError)

      // Ako je subscription nevažeći (410 Gone), obriši ga iz baze
      if (pushError.statusCode === 410 || pushError.statusCode === 404) {
        console.log('🗑️ Brisanje nevažećeg subscription-a')
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', payload.userId)
      }

      return NextResponse.json(
        { error: 'Greška pri slanju push notifikacije', details: pushError.message },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Error in push notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint za testiranje
export async function GET() {
  const isConfigured = !!(vapidPublicKey && vapidPrivateKey)
  
  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Push notifications su konfigurisane' 
      : 'VAPID keys nisu konfigurisani. Generišite ih sa: npx web-push generate-vapid-keys'
  })
}

