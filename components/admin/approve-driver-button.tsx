'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ApproveDriverButtonProps {
  prijavaId: string
  vozacId: string
  turaId: string
  turaInfo: {
    polazak: string
    destinacija: string
    datum: string
  }
  vozacIme?: string
}

export function ApproveDriverButton({ prijavaId, vozacId, turaId, turaInfo, vozacIme }: ApproveDriverButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [razlogOdbijanja, setRazlogOdbijanja] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      // 1. Odobri prijavu
      const { error: prijavaError } = await supabase
        .from('prijave')
        .update({ status: 'odobreno' })
        .eq('id', prijavaId)

      if (prijavaError) throw prijavaError

      // 2. Promeni status ture na "dodeljena" i dodeli vozača
      const { error: turaError, data: turaData } = await supabase
        .from('ture')
        .update({ 
          status: 'dodeljena',
          dodeljeni_vozac_id: vozacId
        })
        .eq('id', turaId)
        .select('firma_id')
        .single()

      if (turaError) {
        console.error('Greška pri dodeli vozača:', turaError)
        throw turaError
      }

      // 3. Odbij sve ostale prijave za ovu turu
      const { error: odbijanjeError } = await supabase
        .from('prijave')
        .update({ 
          status: 'odbijeno',
          razlog_odbijanja: 'Odabran je drugi vozač za ovu turu.'
        })
        .eq('tura_id', turaId)
        .neq('id', prijavaId)

      if (odbijanjeError) throw odbijanjeError

      // 4. Kreiraj notifikaciju za odobrenog vozača
      const { error: notifikacijaError } = await supabase
        .from('notifikacije')
        .insert({
          vozac_id: vozacId,
          prijava_id: prijavaId,
          tip: 'odobreno',
          poruka: `Vaša prijava za turu ${turaInfo.polazak} → ${turaInfo.destinacija} (${new Date(turaInfo.datum).toLocaleDateString('sr-RS')}) je odobrena! 🎉`
        })

      if (notifikacijaError) {
        console.error('Greška pri kreiranju notifikacije:', notifikacijaError)
        // Ne prekidaj proces zbog greške u notifikaciji
      }

      // 4b. Kreiraj notifikaciju za poslodavca da je vozač dodeljen
      if (turaData?.firma_id) {
        await supabase
          .from('notifikacije')
          .insert({
            vozac_id: turaData.firma_id,
            tura_id: turaId,
            tip: 'vozac_dodeljen',
            poruka: `🚚 Vozač ${vozacIme || 'je'} dodeljen vašoj turi ${turaInfo.polazak} → ${turaInfo.destinacija}! Možete ga kontaktirati putem aplikacije.`
          })
      }

      // 5. Kreiraj notifikacije za odbijene vozače
      const { data: odbijeniVozaci } = await supabase
        .from('prijave')
        .select('vozac_id, id')
        .eq('tura_id', turaId)
        .eq('status', 'odbijeno')
        .neq('id', prijavaId)

      if (odbijeniVozaci && odbijeniVozaci.length > 0) {
        const notifikacije = odbijeniVozaci.map((p: any) => ({
          vozac_id: p.vozac_id,
          prijava_id: p.id,
          tip: 'odbijeno',
          poruka: `Vaša prijava za turu ${turaInfo.polazak} → ${turaInfo.destinacija} (${new Date(turaInfo.datum).toLocaleDateString('sr-RS')}) je odbijena. Razlog: Odabran je drugi vozač za ovu turu.`
        }))

        await supabase.from('notifikacije').insert(notifikacije)
      }

      router.refresh()
    } catch (error: any) {
      console.error('Error pri odobravanju:', error)
      const errorMessage = error?.message || 'Došlo je do greške. Pokušajte ponovo.'
      alert(`Greška pri odobravanju vozača: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!razlogOdbijanja.trim()) {
      alert('Molimo unesite razlog odbijanja.')
      return
    }

    setIsLoading(true)
    try {
      // 1. Odbij prijavu
      const { error: odbijanjeError } = await supabase
        .from('prijave')
        .update({ 
          status: 'odbijeno',
          razlog_odbijanja: razlogOdbijanja.trim()
        })
        .eq('id', prijavaId)

      if (odbijanjeError) throw odbijanjeError

      // 2. Kreiraj notifikaciju za odbijenog vozača
      const { error: notifikacijaError } = await supabase
        .from('notifikacije')
        .insert({
          vozac_id: vozacId,
          prijava_id: prijavaId,
          tip: 'odbijeno',
          poruka: `Vaša prijava za turu ${turaInfo.polazak} → ${turaInfo.destinacija} (${new Date(turaInfo.datum).toLocaleDateString('sr-RS')}) je odbijena. Razlog: ${razlogOdbijanja.trim()}`
        })

      if (notifikacijaError) {
        console.error('Greška pri kreiranju notifikacije:', notifikacijaError)
        // Ne prekidaj proces zbog greške u notifikaciji
      }

      setShowRejectDialog(false)
      setRazlogOdbijanja('')
      router.refresh()
    } catch (error: any) {
      console.error('Error pri odbijanju:', error)
      const errorMessage = error?.message || 'Došlo je do greške. Pokušajte ponovo.'
      alert(`Greška pri odbijanju vozača: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleApprove}
        disabled={isLoading}
        className="flex-1"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Odobri
      </Button>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={isLoading}
            className="flex-1"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Odbij
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odbij vozača</DialogTitle>
            <DialogDescription>
              Molimo unesite razlog odbijanja. Ova poruka će biti vidljiva vozaču.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="razlog">Razlog odbijanja</Label>
              <Textarea
                id="razlog"
                placeholder="Npr. Niste ispunili uslove za ovu turu..."
                value={razlogOdbijanja}
                onChange={(e) => setRazlogOdbijanja(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Otkaži
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isLoading || !razlogOdbijanja.trim()}>
              Odbij vozača
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

