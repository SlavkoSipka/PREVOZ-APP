'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

interface CheckSubscriptionButtonProps {
  userId: string
}

export function CheckSubscriptionButton({ userId }: CheckSubscriptionButtonProps) {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<string>('')
  const supabase = createClient()

  const checkSubscription = async () => {
    setChecking(true)
    setResult('')
    
    try {
      // 1. Proveri permission
      const permission = Notification.permission
      const info: string[] = []
      
      info.push(`📋 Permission: ${permission}`)
      
      // 2. Proveri subscription u browser-u
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        info.push(`✅ Service Worker: Registrovan`)
        
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          info.push(`✅ Browser subscription: Postoji`)
          info.push(`📍 Endpoint: ${subscription.endpoint.substring(0, 50)}...`)
        } else {
          info.push(`❌ Browser subscription: NE POSTOJI`)
        }
      } else {
        info.push(`❌ Service Worker: NIJE registrovan`)
      }
      
      // 3. Proveri subscription u bazi
      const { data: dbSub, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()  // ← maybeSingle() ne baca error ako nema red-ova
      
      if (error) {
        info.push(`❌ Baza: Greška pri proveri`)
        info.push(`   Error: ${error.message}`)
      } else if (dbSub) {
        info.push(`✅ Baza: Subscription postoji`)
        info.push(`   Created: ${new Date(dbSub.created_at).toLocaleString('sr-RS')}`)
        info.push(`   Updated: ${new Date(dbSub.updated_at).toLocaleString('sr-RS')}`)
      } else {
        info.push(`⚠️ Baza: Subscription NE POSTOJI (treba da se kreira)`)
      }
      
      setResult(info.join('\n'))
      
      // Alert za brzo čitanje
      alert(info.join('\n'))
      
    } catch (error: any) {
      setResult(`❌ Greška: ${error.message}`)
      alert(`❌ Greška: ${error.message}`)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={checkSubscription}
        disabled={checking}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Bell className="mr-2 h-4 w-4" />
        {checking ? 'Proveravam...' : '🔍 Proveri Push Status'}
      </Button>
      
      {result && (
        <div className="p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  )
}

