'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TestPaymentButtonProps {
  vozacId: string
  uplateIds: string[]
  iznos: number
}

export function TestPaymentButton({ vozacId, uplateIds, iznos }: TestPaymentButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleTestPayment = async () => {
    setLoading(true)

    try {
      // Simulacija plaćanja (poziv test endpoint-a)
      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vozac_id: vozacId,
          uplate_ids: uplateIds,
          iznos: iznos,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri obradi plaćanja')
      }

      // Prikaz success stanja
      setSuccess(true)
      
      setTimeout(() => {
        toast({
          title: '✅ Test plaćanje uspešno!',
          description: 'Nalog je odblokiran. Preusmeravamo vas...',
        })
        
        // Preusmeravanje na success stranicu
        router.push('/placanje-uspesno')
      }, 2000)

    } catch (error: any) {
      console.error('Test payment error:', error)
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške pri simulaciji plaćanja.',
        variant: 'destructive',
      })
      setShowModal(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        size="lg" 
        className="w-full"
      >
        <CreditCard className="mr-2 h-5 w-5" />
        🧪 Simuliraj plaćanje (TEST MODE)
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {success ? '✅ Plaćanje uspešno!' : '🧪 Test plaćanje'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {success ? (
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-green-700">
                  Test plaćanje je uspešno!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Vaš nalog je odblokiran.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Ovo je <strong>test faza</strong> aplikacije. Pritiskom na dugme ispod, 
                  simuliraćete uspešno plaćanje provizije.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Šta će se desiti:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Uplate će biti označene kao plaćene</li>
                    <li>Nalog će biti odblokiran</li>
                    <li>Nećete biti stvarno naplaćeni</li>
                    <li>Moći ćete nastaviti korišćenje platforme</li>
                  </ul>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Iznos za plaćanje: <span className="text-primary">{iznos.toFixed(2)} €</span>
                </p>
              </>
            )}
          </div>
          {!success && (
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Otkaži
              </Button>
              <Button 
                onClick={handleTestPayment}
                disabled={loading}
              >
                {loading ? 'Obrada...' : '✓ Potvrdi test plaćanje'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

