'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { useToast } from '@/hooks/use-toast'

interface EnableNotificationsBannerProps {
  userId: string
}

export function EnableNotificationsBanner({ userId }: EnableNotificationsBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const { toast } = useToast()
  
  const {
    isSupported,
    permission,
    subscribe,
    isLoading,
    error,
    debugInfo
  } = usePushNotifications(userId)

  // Proveri da li treba prikazati banner
  useEffect(() => {
    console.log('🔔 Push Banner Check:', { isSupported, permission })
    
    if (!isSupported) {
      console.log('❌ Browser ne podržava push notifikacije')
      return
    }

    // Proveri localStorage da li je korisnik već odbio ili omogućio
    const dismissed = localStorage.getItem('push-notifications-dismissed')
    console.log('📦 LocalStorage dismissed:', dismissed)
    
    if (dismissed === 'true') {
      console.log('ℹ️ Banner je već dismissed')
      return
    }

    // Prikaži banner samo ako dozvola nije data
    console.log('🔍 Permission status:', permission)
    if (permission === 'default') {
      console.log('✅ Prikazujem banner!')
      setShowBanner(true)
    } else if (permission === 'granted') {
      console.log('✅ Notifikacije već omogućene')
    } else if (permission === 'denied') {
      console.log('❌ Notifikacije odbijene')
    }
  }, [isSupported, permission])

  // Handle greške - prikaži samo jednom
  useEffect(() => {
    if (error) {
      // Ne pokazuj grešku ako je samo 'default' status ostao
      if (!error.includes('Nepoznat status dozvole: default')) {
        toast({
          title: 'Obaveštenje',
          description: error,
          variant: 'destructive'
        })
      }
    }
  }, [error, toast])

  const handleEnable = async () => {
    console.log('🔔 Korisnik kliknuo "Omogući"')
    
    try {
      const sub = await subscribe()
      console.log('📦 Subscribe rezultat:', sub)
      
      if (sub) {
        console.log('✅ Subscription uspešan!')
        toast({
          title: '✅ Notifikacije omogućene!',
          description: 'Sada ćete primati obaveštenja na ovom uređaju.',
        })
        setShowBanner(false)
        localStorage.setItem('push-notifications-dismissed', 'true')
      } else {
        console.log('❌ Subscription nije uspeo, ali nema error-a')
      }
    } catch (err) {
      console.error('❌ Exception u handleEnable:', err)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setShowBanner(false)
    localStorage.setItem('push-notifications-dismissed', 'true')
  }

  if (!showBanner || isDismissed || !isSupported) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 shadow-2xl border-2 border-primary/20 animate-in slide-in-from-bottom-5">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <Bell className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base mb-1">
              Omogućite obaveštenja
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              Primajte trenutna obaveštenja o novim turama, prijavama i porukama direktno na vaš uređaj.
            </p>

            {/* Buttons */}
            <div className="flex gap-2 mb-2">
              <Button
                size="sm"
                onClick={handleEnable}
                disabled={isLoading}
                className="flex-1 sm:flex-initial touch-manipulation"
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Omogući
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                disabled={isLoading}
                className="touch-manipulation"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Ne sada
              </Button>
            </div>

            {/* Debug Toggle Button - SAMO ZA TESTIRANJE */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDebug(!showDebug)}
              className="text-[10px] h-6 px-2 mb-2"
            >
              🐛 {showDebug ? 'Sakrij' : 'Prikaži'} Debug Info
            </Button>

            {/* Debug Info - Vidljiv na ekranu */}
            {showDebug && debugInfo && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-[9px] font-mono overflow-auto max-h-40">
                <pre className="whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            )}

            {/* Ručno omogućavanje - za Android */}
            {error && error.includes('RUČNO') && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs font-semibold mb-2">📱 Kako ručno omogućiti na Android-u:</p>
                <ol className="text-[10px] space-y-1 ml-4 list-decimal">
                  <li>Kliknite <strong>⋮ (3 tačke)</strong> gore desno</li>
                  <li>Kliknite <strong>Settings</strong></li>
                  <li>Kliknite <strong>Site settings</strong></li>
                  <li>Kliknite <strong>Notifications</strong></li>
                  <li>Pod <strong>Allowed</strong> sekcijom kliknite <strong>Add site</strong></li>
                  <li>Upišite: <code className="bg-gray-200 px-1">test.aislike.rs</code></li>
                  <li>Vrati se na sajt i refresh (povuci dole)</li>
                </ol>
              </div>
            )}

            {/* Info text */}
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
              💡 Ako dijalog ne izlazi, koristite ručno omogućavanje iznad
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

