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
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatVreme } from '@/lib/utils'

interface ZavrsiTuruButtonProps {
  turaId: string
  vozacId: string
  iznos?: number // Optional - više se ne koristi
}

export function ZavrsiTuruButton({ turaId, vozacId, iznos }: ZavrsiTuruButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleZavrsi = async () => {
    setLoading(true)

    try {
      // Prvo dobij podatke o turi za razlog blokiranja
      const { data: turaData } = await supabase
        .from('ture')
        .select('polazak, destinacija, datum, vreme_polaska, firma_id')
        .eq('id', turaId)
        .single()

      // Ažuriranje statusa ture
      const { error: turaError } = await supabase
        .from('ture')
        .update({ status: 'zavrsena' })
        .eq('id', turaId)

      if (turaError) {
        toast({
          title: 'Greška',
          description: turaError.message,
          variant: 'destructive',
        })
        return
      }

      // Ažuriranje statusa prijave na 'zavrseno'
      const { error: prijavaError } = await supabase
        .from('prijave')
        .update({ status: 'zavrseno' })
        .eq('tura_id', turaId)
        .eq('vozac_id', vozacId)

      if (prijavaError) {
        toast({
          title: 'Greška',
          description: 'Problem sa ažuriranjem prijave: ' + prijavaError.message,
          variant: 'destructive',
        })
        return
      }

      // UKLONJENA LOGIKA ZA PLAĆANJE - Aplikacija je u beta verziji i besplatna
      // Više ne kreiramo zapise u tabeli 'uplate'

      // Pošalji notifikaciju poslodavcu da je tura završena
      if (turaData?.firma_id) {
        console.log('🔔 Kreiram notifikaciju za poslodavca o završenoj turi:', {
          vozac_id: turaData.firma_id,
          tip: 'tura_zavrsena',
          tura_id: turaId
        })
        
        const { data: notifData, error: notifError } = await supabase
          .from('notifikacije')
          .insert({
            vozac_id: turaData.firma_id,
            tura_id: turaId,
            tip: 'tura_zavrsena',
            poruka: `🎉 Tura ${turaData.polazak} → ${turaData.destinacija} je uspešno završena! Hvala vam što koristite PreveziMe. Možete oceniti vozača kako biste pomogli drugim korisnicima.`
          })
          .select()
        
        if (notifError) {
          console.error('❌ Greška pri kreiranju notifikacije za poslodavca:', notifError)
        } else {
          console.log('✅ Notifikacija za poslodavca o završenoj turi kreirana:', notifData)
        }
      } else {
        console.warn('⚠️ turaData.firma_id nije pronađen, notifikacija NIJE kreirana!')
      }

      // Uspešno završeno - prebacujemo na zahvalnicu
      toast({
        title: '✅ Tura uspešno završena!',
        description: 'Hvala što koristite PreveziMe platformu.',
      })

      // Zatvaranje modala i preusmeravanje na zahvalnicu
      setShowModal(false)
      router.push('/tura-zavrsena')
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
    <>
      <Button 
        onClick={() => setShowModal(true)}
        size="lg"
        className="w-full"
      >
        Završio sam turu
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrda završetka ture</DialogTitle>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <p>
                Da li ste sigurni da ste završili ovu turu?
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                <p className="font-semibold text-green-800 text-sm">
                  🎉 Beta verzija - Besplatno!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  PreveziMe je trenutno u beta fazi. Nema provizije ni dodatnih troškova.
                </p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Otkaži
            </Button>
            <Button 
              onClick={handleZavrsi}
              disabled={loading}
            >
              {loading ? 'Obrada...' : 'Potvrdi završetak ture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

