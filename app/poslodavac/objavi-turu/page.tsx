'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TimePicker } from '@/components/ui/time-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Info, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function ObjaviTuruPage() {
  const [loading, setLoading] = useState(false)
  const [dan, setDan] = useState<string>('')
  const [mesec, setMesec] = useState<string>('')
  const [godina, setGodina] = useState<string>(new Date().getFullYear().toString())
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
    faktura: 'nije_obavezna',
  })
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Generisi dane (1-31)
  const dani = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
  
  // Meseci
  const meseci = [
    { value: '1', label: 'Januar' },
    { value: '2', label: 'Februar' },
    { value: '3', label: 'Mart' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Maj' },
    { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' },
    { value: '8', label: 'Avgust' },
    { value: '9', label: 'Septembar' },
    { value: '10', label: 'Oktobar' },
    { value: '11', label: 'Novembar' },
    { value: '12', label: 'Decembar' },
  ]

  // Godine (trenutna i sledeća)
  const trenutnaGodina = new Date().getFullYear()
  const godine = [trenutnaGodina.toString(), (trenutnaGodina + 1).toString()]

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

      if (!dan || !mesec || !godina) {
        toast({
          title: 'Greška',
          description: 'Izaberite datum transporta (dan, mesec i godinu).',
          variant: 'destructive',
        })
        return
      }

      // Kreiraj datum iz odabranih vrednosti
      const izabraniDatum = `${godina}-${mesec.padStart(2, '0')}-${dan.padStart(2, '0')}`

      const { error } = await supabase.from('ture').insert({
        firma_id: user.id,
        polazak: formData.polazak,
        destinacija: formData.destinacija,
        datum: izabraniDatum,
        opis_robe: formData.opis_robe,
        ponudjena_cena: parseFloat(formData.ponudjena_cena),
        tacna_adresa_polazak: formData.tacna_adresa_polazak || null,
        tacna_adresa_destinacija: formData.tacna_adresa_destinacija || null,
        vreme_polaska: formData.vreme_polaska || null,
        kontakt_telefon: formData.kontakt_telefon || null,
        dodatne_napomene: formData.dodatne_napomene || null,
        faktura: formData.faktura,
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

      router.push('/poslodavac')
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
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/poslodavac">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Info kartica - levo */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Proces objavljivanja</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Korak 1 */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Popunite podatke</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unesite sve potrebne informacije o turi
                      </p>
                    </div>
                  </div>

                  {/* Korak 2 */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Čekanje na odobrenje</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Administrator će pregledati vašu turu i odobriti je
                      </p>
                    </div>
                  </div>

                  {/* Korak 3 */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Tura aktivna</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vozači mogu da vide i prijave se na turu
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-900 leading-relaxed">
                      <strong>Napomena:</strong> Sve objavljene ture prolaze kroz proces verifikacije od strane administratora pre nego što postanu vidljive vozačima. Ovo osigurava kvalitet i sigurnost na platformi.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forma - desno */}
          <div className="lg:col-span-2">
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
                  <div className="grid grid-cols-3 gap-2">
                    {/* Dan */}
                    <Select value={dan} onValueChange={setDan} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dan" />
                      </SelectTrigger>
                      <SelectContent>
                        {dani.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}.
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Mesec */}
                    <Select value={mesec} onValueChange={setMesec} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Mesec" />
                      </SelectTrigger>
                      <SelectContent>
                        {meseci.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Godina */}
                    <Select value={godina} onValueChange={setGodina} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Godina" />
                      </SelectTrigger>
                      <SelectContent>
                        {godine.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

              <div className="space-y-2">
                <Label htmlFor="faktura">Faktura</Label>
                <Select
                  value={formData.faktura}
                  onValueChange={(value) => setFormData({ ...formData, faktura: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite opciju za fakturu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="da">Da - Faktura je obavezna</SelectItem>
                    <SelectItem value="ne">Ne - Faktura nije potrebna</SelectItem>
                    <SelectItem value="nije_obavezna">Nije obavezna - Može ali ne mora</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Da li vozač treba da izdaje fakturu za ovaj transport?
                </p>
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
      </div>
    </div>
  )
}

