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
  const { toast } = useToast()
  
  const {
    isSupported,
    permission,
    subscribe,
    isLoading,
    error
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

  // Handle greške
  useEffect(() => {
    if (error) {
      toast({
        title: 'Greška',
        description: error,
        variant: 'destructive'
      })
    }
  }, [error, toast])

  const handleEnable = async () => {
    const sub = await subscribe()
    
    if (sub) {
      toast({
        title: '✅ Notifikacije omogućene!',
        description: 'Sada ćete primati obaveštenja na ovom uređaju.',
      })
      setShowBanner(false)
      localStorage.setItem('push-notifications-dismissed', 'true')
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
            <div className="flex gap-2">
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

            {/* Info text */}
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
              💡 Možete promeniti ovo u podešavanjima profila
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

