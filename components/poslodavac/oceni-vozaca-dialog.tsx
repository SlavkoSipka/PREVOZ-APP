'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface OceniVozacaDialogProps {
  turaId: string
  vozacId: string
  vozacIme: string
  postojecaOcena?: {
    id: string
    ocena: number
    komentar?: string | null
  } | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onOcenaSubmit?: () => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function OceniVozacaDialog({ 
  turaId, 
  vozacId, 
  vozacIme, 
  postojecaOcena,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onOcenaSubmit,
  buttonVariant = "outline"
}: OceniVozacaDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen
  const [ocena, setOcena] = useState(postojecaOcena?.ocena || 0)
  const [hoverOcena, setHoverOcena] = useState(0)
  const [komentar, setKomentar] = useState(postojecaOcena?.komentar || '')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (ocena === 0) {
      toast({
        title: 'Greška',
        description: 'Molimo vas izaberite ocenu.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // Prvo proveri da li je korisnik autentifikovan
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData.user) {
        throw new Error('Niste prijavljeni. Molimo prijavite se ponovo.')
      }

      console.log('🔍 Trenutni korisnik:', userData.user.id)
      console.log('🔍 Ocenjujem vozača:', vozacId)
      console.log('🔍 Za turu:', turaId)

      // Proveri da li je tura završena
      const { data: turaData, error: turaError } = await supabase
        .from('ture')
        .select('id, status, firma_id, dodeljeni_vozac_id')
        .eq('id', turaId)
        .single()

      console.log('🔍 Tura podaci:', turaData)

      if (turaError) {
        throw new Error('Ne mogu da učitam podatke o turi: ' + turaError.message)
      }

      if (!turaData) {
        throw new Error('Tura ne postoji.')
      }

      if (turaData.status !== 'zavrsena') {
        throw new Error('Možete oceniti vozača samo nakon što je tura završena.')
      }

      if (turaData.firma_id !== userData.user.id) {
        throw new Error('Možete oceniti samo vozače na svojim turama.')
      }

      if (turaData.dodeljeni_vozac_id !== vozacId) {
        throw new Error('Ovaj vozač nije bio dodeljen ovoj turi.')
      }

      if (postojecaOcena) {
        // Ažuriraj postojeću ocenu
        console.log('✏️ Ažuriram ocenu:', { postojecaOcena, ocena, komentar })
        
        const { data, error } = await supabase
          .from('ocene')
          .update({
            ocena: ocena,
            komentar: komentar.trim() || null,
          })
          .eq('id', postojecaOcena.id)
          .select()

        console.log('✅ Update result:', { data, error })
        if (error) {
          console.error('❌ Update error:', error)
          throw new Error(`Greška pri ažuriranju ocene: ${error.message || JSON.stringify(error)}`)
        }
      } else {
        // Kreiraj novu ocenu
        const ocenaData = {
          tura_id: turaId,
          vozac_id: vozacId,
          poslodavac_id: userData.user.id,
          ocena: ocena,
          komentar: komentar.trim() || null,
        }
        
        console.log('➕ Kreiram novu ocenu:', ocenaData)
        console.log('🔑 Auth user ID:', userData.user.id)
        console.log('🔑 Vozac ID:', vozacId)
        console.log('🔑 Tura ID:', turaId)
        
        const { data, error } = await supabase
          .from('ocene')
          .insert(ocenaData)
          .select()

        console.log('✅ Insert result:', { data, error })
        console.log('✅ Data type:', typeof data)
        console.log('✅ Error type:', typeof error)
        console.log('✅ Error full:', JSON.stringify(error, null, 2))
        
        if (error) {
          console.error('❌ Insert error:', error)
          console.error('❌ Error code:', error.code)
          console.error('❌ Error details:', error.details)
          console.error('❌ Error hint:', error.hint)
          console.error('❌ Error message:', error.message)
          console.error('❌ Error full object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
          
          // Proveri da li je problem duplikata
          if (error.code === '23505') {
            throw new Error('Već ste ocenili ovog vozača za ovu turu.')
          }
          
          // Proveri da li je RLS problem
          if (error.code === '42501' || error.message?.includes('policy')) {
            throw new Error('Row Level Security blokira kreiranje ocene. Proverite da ste pokrenuli SQL skriptu POKRENI-OVO-ZA-FIX.sql u Supabase!')
          }
          
          throw new Error(`Greška pri kreiranju ocene: ${error.message || error.hint || error.code || 'Nepoznata greška'}\n\nDetalji: ${JSON.stringify(error)}`)
        }

        if (!data || data.length === 0) {
          throw new Error('Ocena nije kreirana. Proverite Row Level Security politike u Supabase.')
        }
      }

      toast({
        title: '✅ Uspešno!',
        description: postojecaOcena 
          ? 'Ocena je ažurirana.' 
          : 'Vozač je ocenjen. Notifikacija je poslata.',
      })

      setOpen(false)
      router.refresh()
      onOcenaSubmit?.()
    } catch (error: any) {
      console.error('❌ Error ocenjivanja:', error)
      
      // Detaljniji error message
      let errorMessage = 'Došlo je do greške pri ocenjivanju.'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.error_description) {
        errorMessage = error.error_description
      } else if (error?.details) {
        errorMessage = error.details
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast({
        title: 'Greška',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={postojecaOcena ? buttonVariant : buttonVariant} size="sm">
          <Star className="h-4 w-4 mr-2" />
          {postojecaOcena ? 'Izmeni ocenu' : 'Oceni vozača'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {postojecaOcena ? 'Izmeni ocenu' : 'Oceni vozača'}
          </DialogTitle>
          <DialogDescription>
            Ocenite vozača <strong>{vozacIme}</strong> za izvršenu turu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Zvezde za ocenjivanje */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ocena</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOcena(star)}
                  onMouseEnter={() => setHoverOcena(star)}
                  onMouseLeave={() => setHoverOcena(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverOcena || ocena)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {ocena > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {ocena} / 5
                </span>
              )}
            </div>
          </div>

          {/* Komentar */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Komentar <span className="text-gray-500">(opciono)</span>
            </label>
            <Textarea
              placeholder="Napišite komentar o vozaču..."
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {komentar.length} / 500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Otkaži
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || ocena === 0}
          >
            {isLoading ? 'Čuvanje...' : postojecaOcena ? 'Ažuriraj' : 'Oceni'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
