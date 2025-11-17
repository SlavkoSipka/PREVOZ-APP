'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Ban, Unlock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ToggleBlokiranjeButtonProps {
  userId: string
  userName: string
  blokiran: boolean
}

export function ToggleBlokiranjeButton({ userId, userName, blokiran }: ToggleBlokiranjeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleToggle = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ blokiran: !blokiran })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: blokiran ? '✅ Korisnik deblokiran' : '🚫 Korisnik blokiran',
        description: blokiran 
          ? `${userName} ponovo može da prihvata ture.`
          : `${userName} ne može da prihvata nove ture dok ne namiri dugovanja.`,
      })

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {blokiran ? (
          <Button variant="outline" size="sm" className="gap-2">
            <Unlock className="h-4 w-4" />
            Odblokiraj vozača
          </Button>
        ) : (
          <Button variant="destructive" size="sm" className="gap-2">
            <Ban className="h-4 w-4" />
            Blokiraj vozača
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {blokiran ? 'Deblokiraj vozača' : 'Blokiraj vozača'}
          </DialogTitle>
          <DialogDescription>
            {blokiran ? (
              <>
                Da li ste sigurni da želite da odblokirate vozača <strong>{userName}</strong>?
                <br /><br />
                Vozač će ponovo moći da prihvata nove ture i normalno koristi aplikaciju.
              </>
            ) : (
              <>
                Da li ste sigurni da želite da blokirate vozača <strong>{userName}</strong>?
                <br /><br />
                Blokirani vozač:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Može da koristi aplikaciju normalno</li>
                  <li>Vidi sve svoje prijave i ture</li>
                  <li><strong>NE MOŽE da prihvati nove ture</strong></li>
                  <li>Vidi obaveštenje da mora da namiri dugovanja</li>
                </ul>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Otkaži
          </Button>
          <Button
            onClick={handleToggle}
            disabled={loading}
            variant={blokiran ? 'default' : 'destructive'}
          >
            {loading ? 'Obrada...' : blokiran ? 'Odblokiraj' : 'Blokiraj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

