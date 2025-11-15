'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface PrihvatiTuruButtonProps {
  turaId: string
  vozacId: string
  blokiran: boolean
}

export function PrihvatiTuruButton({ turaId, vozacId, blokiran }: PrihvatiTuruButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handlePrihvati = async () => {
    if (blokiran) {
      toast({
        title: 'Nalog je blokiran',
        description: 'Morate platiti proviziju pre nego što možete prihvatiti nove ture.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Kreiranje prijave
      const { error } = await supabase
        .from('prijave')
        .insert({
          tura_id: turaId,
          vozac_id: vozacId,
          status: 'ceka_admina',
        })

      if (error) {
        toast({
          title: 'Greška',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      // Ažuriranje statusa ture
      await supabase
        .from('ture')
        .update({ status: 'na_cekanju' })
        .eq('id', turaId)

      toast({
        title: 'Uspešno!',
        description: 'Prijava je poslata. Čeka se odobrenje od strane admina.',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Došlo je do neočekivane greške.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handlePrihvati} 
      disabled={loading || blokiran}
      size="lg"
      className="w-full"
    >
      {loading ? 'Slanje...' : 'Prihvati turu'}
    </Button>
  )
}

