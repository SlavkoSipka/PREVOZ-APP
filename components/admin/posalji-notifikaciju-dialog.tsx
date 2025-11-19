'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { createNotificationWithPush } from '@/lib/notification-helpers'

interface PosaljiNotifikacijuDialogProps {
  korisnikId: string
  korisnikIme: string
  korisnikUloga: 'vozac' | 'poslodavac'
}

export function PosaljiNotifikacijuDialog({ 
  korisnikId, 
  korisnikIme,
  korisnikUloga 
}: PosaljiNotifikacijuDialogProps) {
  const [open, setOpen] = useState(false)
  const [poruka, setPoruka] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handlePosalji = async () => {
    if (!poruka.trim()) {
      toast({
        title: 'Greška',
        description: 'Molimo unesite poruku.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // Kreiraj notifikaciju (sa push notifikacijom)
      const success = await createNotificationWithPush({
        userId: korisnikId,
        tip: 'admin_poruka',
        poruka: poruka.trim()
      })

      if (!success) {
        throw new Error('Greška pri kreiranju notifikacije')
      }

      toast({
        title: '✅ Notifikacija poslata!',
        description: `Poruka je uspešno poslata korisniku ${korisnikIme} (+ push notifikacija).`,
      })

      // Resetuj formu i zatvori dialog
      setPoruka('')
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške pri slanju notifikacije.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Pošalji notifikaciju
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Pošalji notifikaciju korisniku
          </DialogTitle>
          <DialogDescription>
            Pošaljite tekstualnu poruku korisniku <strong>{korisnikIme}</strong> ({korisnikUloga === 'vozac' ? 'Vozač' : 'Poslodavac'}).
            Korisnik će dobiti notifikaciju u svom panelu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="poruka">Poruka</Label>
            <Textarea
              id="poruka"
              placeholder="Unesite poruku koju želite da pošaljete..."
              value={poruka}
              onChange={(e) => setPoruka(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Poruka će biti prikazana kao "📬 Poruka od administratora" u notifikacijama korisnika.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              setPoruka('')
            }}
            disabled={isLoading}
          >
            Otkaži
          </Button>
          <Button
            onClick={handlePosalji}
            disabled={isLoading || !poruka.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading ? 'Šaljem...' : 'Pošalji notifikaciju'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

