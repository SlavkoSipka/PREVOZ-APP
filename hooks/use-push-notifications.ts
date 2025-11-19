'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotifications(userId?: string) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const supabase = createClient()

  // Proveri da li browser podržava notifikacije
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasNotification = 'Notification' in window
      const hasServiceWorker = 'serviceWorker' in navigator
      const hasPushManager = 'PushManager' in window
      
      // Proveri da li je HTTPS (obavezno za push notifikacije, osim localhost)
      const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost'
      
      // iOS/Safari specifične provere
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      const iOSVersion = isIOS ? parseFloat((navigator.userAgent.match(/OS (\d+)_/) || [])[1]) : 0
      
      // iOS 16.4+ podržava web push
      const iOSSupported = !isIOS || (isIOS && iOSVersion >= 16.4)
      
      const supported = hasNotification && hasServiceWorker && hasPushManager && iOSSupported && isSecureContext
      
      console.log('🔍 Browser Support Check:', {
        hasNotification,
        hasServiceWorker,
        hasPushManager,
        isSecureContext,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        isIOS,
        isSafari,
        iOSVersion,
        iOSSupported,
        supported,
        currentPermission: supported ? Notification.permission : 'N/A',
        userAgent: navigator.userAgent
      })
      
      setIsSupported(supported)
      
      if (!isSecureContext && hasNotification) {
        console.warn('⚠️ Push notifikacije zahtevaju HTTPS!')
      }
      
      if (supported) {
        setPermission(Notification.permission)
      }
    }
  }, [])

  // Registruj Service Worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      console.log('🔧 Registering Service Worker...')
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      
      console.log('✅ Service Worker registered:', registration)
      
      // Čekaj da Service Worker postane aktivan
      if (registration.installing) {
        await new Promise<void>((resolve) => {
          registration.installing!.addEventListener('statechange', (e: any) => {
            if (e.target.state === 'activated') {
              resolve()
            }
          })
        })
      }
      
      return registration
    } catch (err: any) {
      console.error('❌ Service Worker registration failed:', err)
      setError('Neuspešna registracija Service Worker-a')
      return null
    }
  }

  // Traži dozvolu za notifikacije - POJEDNOSTAVLJENA VERZIJA
  const requestPermission = async (): Promise<boolean> => {
    const debug: string[] = []
    
    try {
      setIsLoading(true)
      setError(null)
      
      debug.push('▶️ START requestPermission')
      debug.push(`📱 User Agent: ${navigator.userAgent.substring(0, 50)}...`)
      debug.push(`🔒 isSecureContext: ${window.isSecureContext}`)
      debug.push(`🌐 Protocol: ${window.location.protocol}`)
      
      if (!isSupported) {
        debug.push('❌ Browser nije podržan')
        setDebugInfo(debug.join('\n'))
        setError('Vaš browser ne podržava push notifikacije')
        return false
      }

      const initialPermission = Notification.permission
      debug.push(`🔍 Initial permission: ${initialPermission}`)
      
      // Ako je već odobreno
      if (initialPermission === 'granted') {
        debug.push('✅ Već GRANTED')
        setDebugInfo(debug.join('\n'))
        setPermission('granted')
        return true
      }

      // Ako je već odbijeno
      if (initialPermission === 'denied') {
        debug.push('❌ Već DENIED - resetuj u browser settings')
        setDebugInfo(debug.join('\n'))
        setError('Notifikacije su blokirane. Kliknite 🔒 pored adrese → Site settings → Notifications → Allow')
        return false
      }
      
      debug.push('🎯 Pozivam Notification.requestPermission()...')
      
      // Traži dozvolu
      const result: NotificationPermission = await Notification.requestPermission()
      
      debug.push(`📥 Rezultat: ${result}`)
      debug.push(`🔍 Notification.permission: ${Notification.permission}`)
      
      setPermission(result)
      setDebugInfo(debug.join('\n'))

      if (result === 'granted') {
        debug.push('✅ SUCCESS - GRANTED!')
        setDebugInfo(debug.join('\n'))
        return true
      } else if (result === 'denied') {
        debug.push('❌ User clicked DENY')
        setDebugInfo(debug.join('\n'))
        setError('Odbili ste notifikacije.')
        return false
      } else {
        // Status 'default' - prompt nije izašao
        debug.push('⚠️ Status ostao DEFAULT')
        debug.push('💡 Možda je browser već blokirao notifikacije za ovaj sajt')
        setDebugInfo(debug.join('\n'))
        setError('Dijalog nije izašao. Kliknite 🔒 → Site settings → Notifications → Allow, pa probajte ponovo')
        return false
      }
    } catch (err: any) {
      debug.push(`💥 EXCEPTION: ${err.name} - ${err.message}`)
      setDebugInfo(debug.join('\n'))
      console.error('❌ Error requesting permission:', err)
      setError(`Greška: ${err.message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Subscribe za push notifikacije
  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!isSupported) {
      setError('Vaš browser ne podržava push notifikacije')
      return null
    }

    if (!userId) {
      setError('User ID je potreban za subscription')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log('🚀 === SUBSCRIBE PROCES ZAPOČET ===')
      console.log('📋 User ID:', userId)

      // 1. Traži dozvolu
      console.log('📍 KORAK 1: Tražim dozvolu...')
      const hasPermission = await requestPermission()
      console.log('📍 KORAK 1 - Rezultat:', hasPermission)
      
      if (!hasPermission) {
        console.log('❌ KORAK 1 FAILED - Nema dozvole!')
        return null
      }

      // 2. Registruj Service Worker
      console.log('📍 KORAK 2: Registrujem Service Worker...')
      const registration = await registerServiceWorker()
      console.log('📍 KORAK 2 - Registration:', registration ? '✅ Uspešno' : '❌ Failed')
      
      if (!registration) {
        console.log('❌ KORAK 2 FAILED - Service Worker nije registrovan!')
        return null
      }

      // 3. Proveri postojeći subscription
      console.log('📍 KORAK 3: Proveravam postojeći subscription...')
      let existingSubscription = await registration.pushManager.getSubscription()
      console.log('📍 KORAK 3 - Postojeći subscription:', existingSubscription ? 'Postoji' : 'Ne postoji')
      
      if (existingSubscription) {
        console.log('ℹ️ Već postoji subscription, koristim postojeći')
        setSubscription(existingSubscription)
        await savePushSubscriptionToDatabase(userId, existingSubscription)
        return existingSubscription
      }

      // 4. Kreiraj novi subscription
      console.log('📍 KORAK 4: Kreiram novi subscription...')
      console.log('📝 Creating new push subscription...')
      
      // VAPID Public Key - generisaćemo ga sa web-push library
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key nije konfigurisan')
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource
      })

      console.log('✅ Push subscription created:', newSubscription)
      setSubscription(newSubscription)

      // 5. Sačuvaj u bazu
      await savePushSubscriptionToDatabase(userId, newSubscription)

      return newSubscription
    } catch (err: any) {
      console.error('❌ Error subscribing to push notifications:', err)
      setError(err.message || 'Greška pri kreiranju subscription-a')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Unsubscribe
  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) {
      return false
    }

    try {
      setIsLoading(true)
      setError(null)

      await subscription.unsubscribe()
      setSubscription(null)

      // Obriši iz baze
      if (userId) {
        await deletePushSubscriptionFromDatabase(userId)
      }

      console.log('✅ Unsubscribed from push notifications')
      return true
    } catch (err: any) {
      console.error('❌ Error unsubscribing:', err)
      setError('Greška pri odjavi sa notifikacija')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Sačuvaj subscription u Supabase
  const savePushSubscriptionToDatabase = async (
    userId: string, 
    subscription: PushSubscription
  ) => {
    try {
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: subscriptionData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('❌ Error saving subscription to database:', error)
        throw error
      }

      console.log('✅ Subscription saved to database')
    } catch (err) {
      console.error('❌ Error in savePushSubscriptionToDatabase:', err)
      throw err
    }
  }

  // Obriši subscription iz baze
  const deletePushSubscriptionFromDatabase = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error deleting subscription from database:', error)
      }
    } catch (err) {
      console.error('❌ Error in deletePushSubscriptionFromDatabase:', err)
    }
  }

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    debugInfo,
    subscribe,
    unsubscribe,
    requestPermission
  }
}

// Helper funkcije
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

