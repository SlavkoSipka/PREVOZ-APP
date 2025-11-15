'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function ObjaviTuruPage() {
  const [loading, setLoading] = useState(false)
  const [datum, setDatum] = useState<Date | undefined>()
  const [formData, setFormData] = useState({
    polazak: '',
    destinacija: '',
    opis_robe: '',
    ponudjena_cena: '',
    tacna_adresa_polazak: '',
    tacna_adresa_destinacija: '',
    vreme_polaska: '',
    kontakt_telefon: '',
    dodatne_napomene: '',
  })
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: 'Greška',
          description: 'Niste prijavljeni.',
          variant: 'destructive',
        })
        return
      }

      if (!datum) {
        toast({
          title: 'Greška',
          description: 'Izaberite datum transporta.',
          variant: 'destructive',
        })
        return
      }

      const { error } = await supabase.from('ture').insert({
        firma_id: user.id,
        polazak: formData.polazak,
        destinacija: formData.destinacija,
        datum: format(datum, 'yyyy-MM-dd'),
        opis_robe: formData.opis_robe,
        ponudjena_cena: parseFloat(formData.ponudjena_cena),
        tacna_adresa_polazak: formData.tacna_adresa_polazak || null,
        tacna_adresa_destinacija: formData.tacna_adresa_destinacija || null,
        vreme_polaska: formData.vreme_polaska || null,
        kontakt_telefon: formData.kontakt_telefon || null,
        dodatne_napomene: formData.dodatne_napomene || null,
        status: 'na_cekanju',
      })

      if (error) {
        toast({
          title: 'Greška',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Uspešno!',
        description: 'Tura je uspešno objavljena.',
      })

      router.push('/firma')
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/firma">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Objavi novu turu</CardTitle>
            <CardDescription>
              Popunite podatke o turi i vozači će moći da se prijave
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="polazak">Mesto polaska *</Label>
                  <Input
                    id="polazak"
                    placeholder="Beograd, Srbija"
                    value={formData.polazak}
                    onChange={(e) => setFormData({ ...formData, polazak: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinacija">Destinacija *</Label>
                  <Input
                    id="destinacija"
                    placeholder="Zagreb, Hrvatska"
                    value={formData.destinacija}
                    onChange={(e) => setFormData({ ...formData, destinacija: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Datum transporta *</Label>
                  <DatePicker
                    date={datum}
                    onSelect={setDatum}
                    disabled={loading}
                    placeholder="Kliknite da izaberete datum"
                    minDate={new Date()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Izaberite datum kada treba da se obavi transport
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Vreme polaska</Label>
                  <TimePicker
                    value={formData.vreme_polaska}
                    onChange={(time) => setFormData({ ...formData, vreme_polaska: time })}
                    disabled={loading}
                    placeholder="Kliknite da izaberete vreme"
                  />
                  <p className="text-xs text-muted-foreground">
                    Približno vreme polaska (24h format)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cena">Ponuđena cena (EUR) *</Label>
                <Input
                  id="cena"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="500.00"
                  value={formData.ponudjena_cena}
                  onChange={(e) => setFormData({ ...formData, ponudjena_cena: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opis">Opis robe *</Label>
                <Textarea
                  id="opis"
                  placeholder="Npr. Paleta građevinskog materijala, 1000 kg, pakovano na europaletama..."
                  value={formData.opis_robe}
                  onChange={(e) => setFormData({ ...formData, opis_robe: e.target.value })}
                  required
                  disabled={loading}
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  Opišite vrstu robe, težinu, pakovanje i ostale važne detalje
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tacna_adresa_polazak">Tačna adresa polaska</Label>
                  <Input
                    id="tacna_adresa_polazak"
                    placeholder="Ulica i broj, Beograd"
                    value={formData.tacna_adresa_polazak}
                    onChange={(e) => setFormData({ ...formData, tacna_adresa_polazak: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tacna_adresa_destinacija">Tačna adresa destinacije</Label>
                  <Input
                    id="tacna_adresa_destinacija"
                    placeholder="Ulica i broj, Zagreb"
                    value={formData.tacna_adresa_destinacija}
                    onChange={(e) => setFormData({ ...formData, tacna_adresa_destinacija: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kontakt_telefon">Kontakt telefon</Label>
                <Input
                  id="kontakt_telefon"
                  type="tel"
                  placeholder="+381 60 123 4567"
                  value={formData.kontakt_telefon}
                  onChange={(e) => setFormData({ ...formData, kontakt_telefon: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="napomene">Dodatne napomene</Label>
                <Textarea
                  id="napomene"
                  placeholder="Bilo koje dodatne informacije za vozača..."
                  value={formData.dodatne_napomene}
                  onChange={(e) => setFormData({ ...formData, dodatne_napomene: e.target.value })}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Otkaži
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Objavljivanje...' : 'Objavi turu'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

