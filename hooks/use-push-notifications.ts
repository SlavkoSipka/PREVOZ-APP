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
  const supabase = createClient()

  // Proveri da li browser podržava notifikacije
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
      setIsSupported(supported)
      
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

  // Traži dozvolu za notifikacije
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Vaš browser ne podržava push notifikacije')
      return false
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log('🔔 Tražim dozvolu za notifikacije...')
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        console.log('✅ Dozvola odobrena')
        return true
      } else if (result === 'denied') {
        setError('Odbili ste notifikacije. Omogućite ih u podešavanjima browsera.')
        return false
      } else {
        setError('Niste dali dozvolu za notifikacije')
        return false
      }
    } catch (err: any) {
      console.error('❌ Error requesting permission:', err)
      setError('Greška pri traženju dozvole')
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

      // 1. Traži dozvolu
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        return null
      }

      // 2. Registruj Service Worker
      const registration = await registerServiceWorker()
      if (!registration) {
        return null
      }

      // 3. Proveri postojeći subscription
      let existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log('ℹ️ Već postoji subscription, koristim postojeći')
        setSubscription(existingSubscription)
        await savePushSubscriptionToDatabase(userId, existingSubscription)
        return existingSubscription
      }

      // 4. Kreiraj novi subscription
      console.log('📝 Creating new push subscription...')
      
      // VAPID Public Key - generisaćemo ga sa web-push library
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key nije konfigurisan')
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
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

