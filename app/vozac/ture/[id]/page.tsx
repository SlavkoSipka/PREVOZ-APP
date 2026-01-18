import { redirect, notFound } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Package, Euro, Building2, Phone, Mail, ArrowLeft, CheckCircle, FileText, Info, Clock, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { PrihvatiTuruButton } from '@/components/vozac/prihvati-turu-button'
import { ZavrsiTuruButton } from '@/components/vozac/zavrsi-turu-button'
import { formatVreme } from '@/lib/utils'

export default async function TuraDetaljiPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15)
  const { id } = await params
  
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'vozac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Učitavanje ture sa detaljima firme
  const { data: tura, error } = await supabase
    .from('ture')
    .select(`
      *,
      firma:users!ture_firma_id_fkey(puno_ime, naziv_firme, telefon, email)
    `)
    .eq('id', id)
    .single()

  if (error || !tura) {
    notFound()
  }

  // Provera da li je vozač već prijavio turu
  const { data: prijava } = await supabase
    .from('prijave')
    .select('*')
    .eq('tura_id', id)
    .eq('vozac_id', userData.user.id)
    .single()

  const jePrijavljen = !!prijava
  const jeOdobren = prijava?.status === 'odobreno'
  const cekaSe = prijava?.status === 'ceka_admina'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/vozac">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Info kartica - levo */}
          {!jeOdobren && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Kako funkcioniše?</CardTitle>
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
                        <p className="font-medium text-sm">Prijavite se za turu</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kliknite na "Prihvati turu" dugme ispod
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
                          Administrator će pregledati sve prijave i izabrati jednog vozača
                        </p>
                      </div>
                    </div>

                    {/* Korak 3 */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Odobrenje i kontakt</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ako budete izabrani, dobijate kontakt podatke poslodavca
                        </p>
                      </div>
                    </div>

                    {/* Korak 4 */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-sm">Završite turu</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Nakon završetka, kliknite "Završio sam turu"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-900 leading-relaxed">
                        <strong>Napomena:</strong> Administrator može odobriti samo jednog vozača za turu. Budite brzi u prijavljivanju i profesionalni u komunikaciji!
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs text-green-900 leading-relaxed">
                        <strong>🎉 BETA VERZIJA - BESPLATNO:</strong> PreveziMe je trenutno u beta fazi, što znači da možete koristiti platformu <strong>potpuno besplatno</strong>!
                      </p>
                      <p className="text-xs text-green-800 leading-relaxed">
                        💚 <strong>Nema provizije, nema skrivenih troškova.</strong> Nakon završene ture samo potvrdite završetak i nastavite da koristite platformu bez ikakvih naknada. Uživajte u besplatnom korišćenju dok gradimo najbolju platformu za vas!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Glavni sadržaj - desno */}
          <div className={jeOdobren ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="grid gap-6">
          {/* Osnovna info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {tura.polazak} → {tura.destinacija}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Status ture: <span className="font-semibold">{tura.status}</span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {tura.ponudjena_cena} €
                  </div>
                  <p className="text-sm text-gray-500">Ponuđena cena</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">Polazak</p>
                    <p className="text-gray-600">{tura.polazak}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">Destinacija</p>
                    <p className="text-gray-600">{tura.destinacija}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">Datum i vreme</p>
                    <p className="text-gray-600">
                      {new Date(tura.datum).toLocaleDateString('sr-RS', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {tura.vreme_polaska && (
                        <span className="block mt-1 font-semibold text-primary">
                          Polazak: {formatVreme(tura.vreme_polaska)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Package className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">Vrsta robe</p>
                    <p className="text-gray-600">{tura.opis_robe}</p>
                  </div>
                </div>
              </div>

              {/* Informacija o fakturi */}
              {tura.faktura && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <p className="font-semibold mb-1">Faktura</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        tura.faktura === 'da' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : tura.faktura === 'ne'
                          ? 'bg-gray-100 text-gray-800 border border-gray-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {tura.faktura === 'da' && '✅ Obavezna - Potrebna faktura'}
                        {tura.faktura === 'ne' && '❌ Nije potrebna'}
                        {tura.faktura === 'nije_obavezna' && 'ℹ️ Nije obavezna - Po dogovoru'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status prijave */}
          {cekaSe && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">⏳ Čeka se odobrenje</CardTitle>
                <CardDescription className="text-yellow-700">
                  Vaša prijava je poslata. Admin će uskoro pregledati i odobriti jednog vozača.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {jeOdobren && tura.status !== 'zavrsena' && (
            <Card className="border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">✅ Odobreni ste za ovu turu!</CardTitle>
                <CardDescription className="text-green-700">
                  Možete videti kontakt podatke firme ispod.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Detaljne informacije - vidljivo samo ako je odobren i nije završena */}
          {jeOdobren && tura.status !== 'zavrsena' && (
            <>
              <Card className="border-green-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <MapPin className="mr-2 h-5 w-5" />
                    Detaljne informacije o turi
                  </CardTitle>
                  <CardDescription>
                    Ove informacije su vidljive samo vama kao dodeljenom vozaču
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {tura.tacna_adresa_polazak && (
                      <div>
                        <p className="font-semibold text-sm text-gray-500 mb-1">📍 Tačna adresa polaska</p>
                        <p className="text-gray-900">{tura.tacna_adresa_polazak}</p>
                      </div>
                    )}
                    {tura.tacna_adresa_destinacija && (
                      <div>
                        <p className="font-semibold text-sm text-gray-500 mb-1">📍 Tačna adresa destinacije</p>
                        <p className="text-gray-900">{tura.tacna_adresa_destinacija}</p>
                      </div>
                    )}
                  </div>

                  {tura.vreme_polaska && (
                    <div>
                      <p className="font-semibold text-sm text-gray-500 mb-1">🕐 Vreme polaska</p>
                      <p className="text-gray-900 text-lg">{formatVreme(tura.vreme_polaska)}</p>
                    </div>
                  )}

                  {(tura.kontakt_telefon || tura.kontakt_email) && (
                    <div className="border-t pt-4">
                      <p className="font-semibold text-sm text-gray-500 mb-2">📞 Kontakt za turu</p>
                      <div className="space-y-2">
                        {tura.kontakt_telefon && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-green-600" />
                            <a href={`tel:${tura.kontakt_telefon}`} className="text-primary hover:underline">
                              {tura.kontakt_telefon}
                            </a>
                          </div>
                        )}
                        {tura.kontakt_email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-green-600" />
                            <a href={`mailto:${tura.kontakt_email}`} className="text-primary hover:underline">
                              {tura.kontakt_email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {tura.dodatne_napomene && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="font-semibold text-sm text-blue-800 mb-1">💡 Dodatne napomene:</p>
                      <p className="text-sm text-blue-900 whitespace-pre-wrap">{tura.dodatne_napomene}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    Kontakt podaci poslodavca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tura.firma.naziv_firme && (
                    <div>
                      <p className="font-semibold">Naziv firme</p>
                      <p className="text-gray-600">{tura.firma.naziv_firme}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">Kontakt osoba</p>
                    <p className="text-gray-600">{tura.firma.puno_ime}</p>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    <a href={`tel:${tura.firma.telefon}`} className="text-primary hover:underline">
                      {tura.firma.telefon}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    <a href={`mailto:${tura.firma.email}`} className="text-primary hover:underline">
                      {tura.firma.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Akcije */}
          <Card>
            <CardContent className="pt-6">
              {!jePrijavljen && tura.status === 'aktivna' && (
                <PrihvatiTuruButton 
                  turaId={tura.id} 
                  vozacId={userData.user.id}
                  blokiran={userData.profile.blokiran}
                />
              )}

              {jeOdobren && tura.status === 'dodeljena' && (
                <ZavrsiTuruButton 
                  turaId={tura.id}
                  vozacId={userData.user.id}
                  iznos={15} // Provizija 15 EUR
                />
              )}

              {tura.status === 'zavrsena' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-xl font-bold text-green-800 mb-2">
                    ✅ Tura je uspešno završena
                  </p>
                  <p className="text-sm text-green-700">
                    Uspešno ste završili ovu turu. Hvala vam na profesionalnosti!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

