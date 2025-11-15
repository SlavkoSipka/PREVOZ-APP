'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Send, User, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SendNotificationFormProps {
  vozacId?: string
  vozacIme?: string
  firmaId?: string
  firmaIme?: string
}

export function SendNotificationForm({
  vozacId,
  vozacIme,
  firmaId,
  firmaIme,
}: SendNotificationFormProps) {
  const [vozacPoruka, setVozacPoruka] = useState('')
  const [firmaPoruka, setFirmaPoruka] = useState('')
  const [loadingVozac, setLoadingVozac] = useState(false)
  const [loadingFirma, setLoadingFirma] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleSendToVozac = async () => {
    if (!vozacPoruka.trim()) {
      toast({
        title: 'Greška',
        description: 'Unesite poruku za vozača',
        variant: 'destructive',
      })
      return
    }

    setLoadingVozac(true)
    try {
      const { error } = await supabase
        .from('notifikacije')
        .insert({
          vozac_id: vozacId,
          tip: 'admin_poruka',
          poruka: `📬 Poruka od administratora:\n\n${vozacPoruka}`,
        })

      if (error) throw error

      toast({
        title: 'Uspešno!',
        description: `Notifikacija poslata vozaču: ${vozacIme}`,
      })

      setVozacPoruka('')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingVozac(false)
    }
  }

  const handleSendToFirma = async () => {
    if (!firmaPoruka.trim()) {
      toast({
        title: 'Greška',
        description: 'Unesite poruku za poslodavca',
        variant: 'destructive',
      })
      return
    }

    setLoadingFirma(true)
    try {
      const { error } = await supabase
        .from('notifikacije')
        .insert({
          vozac_id: firmaId,
          tip: 'admin_poruka',
          poruka: `📬 Poruka od administratora:\n\n${firmaPoruka}`,
        })

      if (error) throw error

      toast({
        title: 'Uspešno!',
        description: `Notifikacija poslata poslodavcu: ${firmaIme}`,
      })

      setFirmaPoruka('')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingFirma(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Pošalji vozaču */}
      {vozacId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Pošalji notifikaciju vozaču
            </CardTitle>
            <CardDescription>
              Vozač: <strong>{vozacIme}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="vozac-poruka">Poruka za vozača</Label>
              <Textarea
                id="vozac-poruka"
                placeholder="Npr. Molimo vas kontaktirajte poslodavca što pre..."
                value={vozacPoruka}
                onChange={(e) => setVozacPoruka(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSendToVozac}
                disabled={loadingVozac || !vozacPoruka.trim()}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                {loadingVozac ? 'Slanje...' : 'Pošalji vozaču'}
              </Button>
              <Link href={`/admin/korisnici/${vozacId}`}>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Profil vozača
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pošalji poslodavcu */}
      {firmaId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Pošalji notifikaciju poslodavcu
            </CardTitle>
            <CardDescription>
              Poslodavac: <strong>{firmaIme}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="firma-poruka">Poruka za poslodavca</Label>
              <Textarea
                id="firma-poruka"
                placeholder="Npr. Tura je dodeljena vozaču, sve je u redu..."
                value={firmaPoruka}
                onChange={(e) => setFirmaPoruka(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSendToFirma}
                disabled={loadingFirma || !firmaPoruka.trim()}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                {loadingFirma ? 'Slanje...' : 'Pošalji poslodavcu'}
              </Button>
              <Link href={`/admin/korisnici/${firmaId}`}>
                <Button variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Profil poslodavca
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

