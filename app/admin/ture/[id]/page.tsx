import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, Package, Euro, Building2, Phone, Mail, User, Truck, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatVreme } from '@/lib/utils'
import { SendNotificationForm } from '@/components/admin/send-notification-form'

export default async function AdminTuraDetaljiPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15)
  const { id } = await params
  
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'admin') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Učitaj turu sa svim povezanim podacima
  const { data: tura } = await supabase
    .from('ture')
    .select(`
      *,
      firma:users!ture_firma_id_fkey(
        id,
        puno_ime,
        naziv_firme,
        email,
        telefon
      ),
      dodeljeni_vozac:users!ture_dodeljeni_vozac_id_fkey(
        id,
        puno_ime,
        email,
        telefon
      )
    `)
    .eq('id', id)
    .single()

  if (!tura) {
    redirect('/admin')
  }

  // Učitaj sve prijave za ovu turu
  const { data: prijave } = await supabase
    .from('prijave')
    .select(`
      *,
      vozac:users!prijave_vozac_id_fkey(
        id,
        puno_ime,
        email,
        telefon,
        blokiran
      )
    `)
    .eq('tura_id', id)
    .order('created_at', { ascending: false })

  const statusLabels: { [key: string]: string } = {
    aktivna: '🟢 Aktivna',
    na_cekanju: '🟡 Na čekanju',
    dodeljena: '🔵 Dodeljena',
    zavrsena: '✅ Završena',
  }

  const statusColors: { [key: string]: string } = {
    aktivna: 'bg-green-100 text-green-800',
    na_cekanju: 'bg-yellow-100 text-yellow-800',
    dodeljena: 'bg-blue-100 text-blue-800',
    zavrsena: 'bg-gray-100 text-gray-800',
  }

  const prijaveNaCekanju = prijave?.filter((p: any) => p.status === 'ceka_admina') || []
  const prijaveOdobrene = prijave?.filter((p: any) => p.status === 'odobreno') || []
  const prijaveOdbijene = prijave?.filter((p: any) => p.status === 'odbijeno') || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad na admin panel
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Glavne informacije o turi */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      {tura.polazak} → {tura.destinacija}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Detaljan pregled ture
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[tura.status]}>
                    {statusLabels[tura.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Osnove informacije - polazak i destinacija */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-500">Mesto polaska</p>
                        <p className="text-lg font-semibold">{tura.polazak}</p>
                        {tura.tacna_adresa_polazak && (
                          <p className="text-sm text-gray-600 mt-1">
                            📍 {tura.tacna_adresa_polazak}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-500">Destinacija</p>
                        <p className="text-lg font-semibold">{tura.destinacija}</p>
                        {tura.tacna_adresa_destinacija && (
                          <p className="text-sm text-gray-600 mt-1">
                            📍 {tura.tacna_adresa_destinacija}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datum i vreme */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-gray-500">Datum i vreme transporta</p>
                      <p className="text-lg font-semibold">{new Date(tura.datum).toLocaleDateString('sr-RS', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      {tura.vreme_polaska && (
                        <p className="text-base text-gray-700 mt-1">⏰ Vreme polaska: {formatVreme(tura.vreme_polaska)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Opis robe - važno! */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-500 mb-2">Opis robe</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-base text-gray-900 whitespace-pre-wrap">{tura.opis_robe}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cena */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Euro className="h-6 w-6 text-green-600" />
                      <span className="font-semibold text-gray-700 text-lg">Ponuđena cena:</span>
                    </div>
                    <span className="text-3xl font-bold text-green-600">
                      {tura.ponudjena_cena} €
                    </span>
                  </div>
                </div>

                {/* Kontakt telefon */}
                {tura.kontakt_telefon && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-gray-500">Kontakt telefon poslodavca</p>
                        <p className="text-lg font-semibold">{tura.kontakt_telefon}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dodatne napomene - važno! */}
                {tura.dodatne_napomene && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-500 mb-2">Dodatne napomene</p>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-base text-gray-900 whitespace-pre-wrap">{tura.dodatne_napomene}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Tura kreirana: {new Date(tura.created_at).toLocaleDateString('sr-RS')} u {new Date(tura.created_at).toLocaleTimeString('sr-RS')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prijave vozača */}
            {prijave && prijave.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prijave vozača ({prijave.length})</CardTitle>
                  <CardDescription>Svi vozači koji su se prijavili za ovu turu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {prijaveNaCekanju.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-yellow-700">⏳ Na čekanju ({prijaveNaCekanju.length})</h4>
                      <div className="space-y-2">
                        {prijaveNaCekanju.map((prijava: any) => (
                          <div key={prijava.id} className="border rounded-lg p-3 bg-yellow-50/50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{prijava.vozac.puno_ime}</p>
                                <p className="text-sm text-gray-600">{prijava.vozac.registarske_tablice}</p>
                                <p className="text-xs text-gray-500">
                                  Prijavljeno: {new Date(prijava.created_at).toLocaleDateString('sr-RS')}
                                </p>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/korisnici/${prijava.vozac.id}`}>
                                  Pogledaj vozača
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prijaveOdobrene.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">✅ Odobrene ({prijaveOdobrene.length})</h4>
                      <div className="space-y-2">
                        {prijaveOdobrene.map((prijava: any) => (
                          <div key={prijava.id} className="border rounded-lg p-3 bg-green-50/50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{prijava.vozac.puno_ime}</p>
                                <p className="text-sm text-gray-600">{prijava.vozac.registarske_tablice}</p>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/korisnici/${prijava.vozac.id}`}>
                                  Pogledaj vozača
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prijaveOdbijene.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-700">❌ Odbijene ({prijaveOdbijene.length})</h4>
                      <div className="space-y-2">
                        {prijaveOdbijene.map((prijava: any) => (
                          <div key={prijava.id} className="border rounded-lg p-3 bg-red-50/50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{prijava.vozac.puno_ime}</p>
                                <p className="text-sm text-gray-600">{prijava.vozac.registarske_tablice}</p>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/korisnici/${prijava.vozac.id}`}>
                                  Pogledaj vozača
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Informacije o firmi i vozaču */}
          <div className="space-y-6">
            {/* Firma */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Firma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Naziv firme</p>
                  <p className="font-semibold">{tura.firma.naziv_firme || tura.firma.puno_ime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="text-sm">{tura.firma.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Telefon
                  </p>
                  <p className="text-sm">{tura.firma.telefon}</p>
                </div>
              </CardContent>
            </Card>

            {/* Dodeljeni vozač */}
            {tura.dodeljeni_vozac && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Dodeljeni vozač
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Ime</p>
                    <p className="font-semibold">{tura.dodeljeni_vozac.puno_ime}</p>
                  </div>
                  {tura.dodeljeni_vozac.registarske_tablice && (
                    <div>
                      <p className="text-sm text-gray-500">Registarske tablice</p>
                      <p className="font-semibold">{tura.dodeljeni_vozac.registarske_tablice}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="text-sm">{tura.dodeljeni_vozac.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Telefon
                    </p>
                    <p className="text-sm">{tura.dodeljeni_vozac.telefon}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full mt-4">
                    <Link href={`/admin/korisnici/${tura.dodeljeni_vozac.id}`}>
                      Pogledaj profil vozača
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Slanje notifikacija */}
            <SendNotificationForm
              vozacId={tura.dodeljeni_vozac?.id}
              vozacIme={tura.dodeljeni_vozac?.puno_ime}
              firmaId={tura.firma.id}
              firmaIme={tura.firma.naziv_firme || tura.firma.puno_ime}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

