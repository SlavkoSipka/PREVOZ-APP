'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, MapPin, Calendar, Package, Euro, Clock, Phone, MessageSquare, Info } from 'lucide-react'
import Link from 'next/link'
import { formatVreme } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Tura {
  id: string
  polazak: string
  destinacija: string
  datum: string
  opis_robe: string
  ponudjena_cena: number
  status: string
  created_at: string
  tacna_adresa_polazak?: string
  tacna_adresa_destinacija?: string
  vreme_polaska?: string
  kontakt_telefon?: string
  dodatne_napomene?: string
  firma: {
    puno_ime: string
    naziv_firme?: string
    email: string
    telefon?: string
  }
}

interface TureApprovalListProps {
  ture: Tura[]
}

export function TureApprovalList({ ture: initialTure }: TureApprovalListProps) {
  const [ture, setTure] = useState(initialTure)
  const [selectedTura, setSelectedTura] = useState<Tura | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [razlog, setRazlog] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleAction = (tura: Tura, actionType: 'approve' | 'reject') => {
    setSelectedTura(tura)
    setAction(actionType)
    setShowDialog(true)
    setRazlog('')
  }

  const confirmAction = async () => {
    if (!selectedTura || !action) return

    setLoading(true)

    try {
      if (action === 'approve') {
        // Odobri turu - postavi status na 'aktivna'
        const { error, data: turaData } = await supabase
          .from('ture')
          .update({ status: 'aktivna' })
          .eq('id', selectedTura.id)
          .select('firma_id')
          .single()

        if (error) throw error

        // Pošalji notifikaciju poslodavcu da je tura odobrena
        await supabase
          .from('notifikacije')
          .insert({
            vozac_id: turaData.firma_id,
            tip: 'tura_odobrena',
            tura_id: selectedTura.id,
            poruka: `✅ Vaša tura ${selectedTura.polazak} → ${selectedTura.destinacija} je odobrena od strane administratora i sada je vidljiva vozačima!`
          })

        toast({
          title: 'Tura odobrena!',
          description: `Tura ${selectedTura.polazak} → ${selectedTura.destinacija} je odobrena i sada je vidljiva vozačima.`,
        })

        // Ukloni turu iz liste
        setTure(ture.filter((t) => t.id !== selectedTura.id))
      } else {
        // Odbij turu - postavi status na 'odbijena' (NE briši!)
        const { error } = await supabase
          .from('ture')
          .update({ 
            status: 'odbijena',
            dodatne_napomene: razlog ? `❌ Razlog odbijanja: ${razlog}` : '❌ Tura odbijena od strane administratora'
          })
          .eq('id', selectedTura.id)

        if (error) throw error

        toast({
          title: 'Tura odbijena',
          description: `Tura je odbijena${razlog ? `: ${razlog}` : '.'}`,
        })

        // Ukloni turu iz liste (jer više nije na čekanju)
        setTure(ture.filter((t) => t.id !== selectedTura.id))

        // TODO: Poslati notifikaciju poslodavcu
      }

      setShowDialog(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (ture.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          Nema tura na čekanju za odobravanje.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {ture.map((tura) => (
          <Card key={tura.id} className="border-orange-200 bg-orange-50/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">
                    {tura.polazak} → {tura.destinacija}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(tura.datum).toLocaleDateString('sr-RS')}
                    </span>
                    {tura.vreme_polaska && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatVreme(tura.vreme_polaska)}
                      </span>
                    )}
                    <Badge variant="outline" className="bg-orange-100">
                      Na čekanju
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {tura.ponudjena_cena} €
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Poslodavac</p>
                  <p className="font-semibold">
                    {tura.firma.naziv_firme || tura.firma.puno_ime}
                  </p>
                  <p className="text-sm text-gray-600">{tura.firma.email}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500">Opis robe</p>
                  <p className="text-gray-900">{tura.opis_robe}</p>
                </div>
              </div>

              {/* Detaljne informacije */}
              {(tura.tacna_adresa_polazak || tura.tacna_adresa_destinacija) && (
                <div className="border-t pt-4 space-y-2">
                  <p className="font-semibold text-sm text-gray-700">📍 Detaljne adrese:</p>
                  {tura.tacna_adresa_polazak && (
                    <p className="text-sm">
                      <span className="font-semibold">Polazak:</span> {tura.tacna_adresa_polazak}
                    </p>
                  )}
                  {tura.tacna_adresa_destinacija && (
                    <p className="text-sm">
                      <span className="font-semibold">Destinacija:</span> {tura.tacna_adresa_destinacija}
                    </p>
                  )}
                </div>
              )}

              {(tura.kontakt_telefon || tura.dodatne_napomene) && (
                <div className="border-t pt-4 space-y-2">
                  {tura.kontakt_telefon && (
                    <p className="text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="font-semibold">Kontakt:</span>&nbsp;{tura.kontakt_telefon}
                    </p>
                  )}
                  {tura.dodatne_napomene && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center mb-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Dodatne napomene:
                      </p>
                      <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                        {tura.dodatne_napomene}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href={`/admin/ture/${tura.id}`}>
                    <Info className="mr-2 h-4 w-4" />
                    Pogledaj sve detalje (tura + poslodavac)
                  </Link>
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAction(tura, 'approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Odobri turu
                  </Button>
                  <Button
                    onClick={() => handleAction(tura, 'reject')}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Odbij turu
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog za potvrdu */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? '✅ Odobri turu' : '❌ Odbij turu'}
            </DialogTitle>
            <DialogDescription>
              {selectedTura && (
                <span>
                  Tura: <strong>{selectedTura.polazak} → {selectedTura.destinacija}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {action === 'approve' ? (
            <p>
              Tura će biti odobrena i postati vidljiva svim vozačima na platformi.
            </p>
          ) : (
            <div className="space-y-3">
              <p>Tura će biti obrisana. Molimo navedite razlog odbijanja:</p>
              <div className="space-y-2">
                <Label htmlFor="razlog">Razlog odbijanja (opciono)</Label>
                <Textarea
                  id="razlog"
                  placeholder="npr. Neprikladne informacije, pogrešni podaci..."
                  value={razlog}
                  onChange={(e) => setRazlog(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={loading}
            >
              Otkaži
            </Button>
            <Button
              onClick={confirmAction}
              disabled={loading}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={action === 'reject' ? 'destructive' : 'default'}
            >
              {loading ? 'Učitavanje...' : action === 'approve' ? 'Odobri' : 'Odbij'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

