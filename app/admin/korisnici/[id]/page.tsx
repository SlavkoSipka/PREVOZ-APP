import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Truck, Mail, Phone, Calendar, MapPin, Package, Euro, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { PosaljiNotifikacijuDialog } from '@/components/admin/posalji-notifikaciju-dialog'
import { ToggleBlokiranjeButton } from '@/components/admin/toggle-blokiranje-button'

export default async function KorisnikProfilPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15)
  const { id } = await params
  
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'admin') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Učitaj korisnika (vozača ili poslodavca)
  const { data: korisnik } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!korisnik || (korisnik.uloga !== 'vozac' && korisnik.uloga !== 'poslodavac')) {
    redirect('/admin')
  }

  const jeVozac = korisnik.uloga === 'vozac'

  // Učitaj podatke u zavisnosti od uloge
  let prijave = null
  let ture = null
  
  if (jeVozac) {
    // Za vozača: učitaj prijave
    const { data } = await supabase
      .from('prijave')
      .select(`
        *,
        tura:ture(*)
      `)
      .eq('vozac_id', id)
      .order('created_at', { ascending: false })
    prijave = data

    // Statistike za vozača
    var dodeljene = prijave?.filter((p: any) => 
      p.status === 'odobreno' && 
      p.tura && 
      (p.tura.status === 'dodeljena' || p.tura.status === 'aktivna')
    ) || []

    var zavrsene = prijave?.filter((p: any) => 
      p.status === 'odobreno' && 
      p.tura && 
      p.tura.status === 'zavrsena'
    ) || []

    var naCekanju = prijave?.filter((p: any) => p.status === 'ceka_admina') || []
    var odbijene = prijave?.filter((p: any) => p.status === 'odbijeno') || []
  } else {
    // Za poslodavca: učitaj njegove ture
    const { data } = await supabase
      .from('ture')
      .select(`
        *,
        vozac:users!ture_dodeljeni_vozac_id_fkey(
          id,
          puno_ime,
          email,
          telefon
        )
      `)
      .eq('firma_id', id)
      .order('created_at', { ascending: false })
    ture = data

    // Statistike za poslodavca
    var dodeljene = ture?.filter((t: any) => t.status === 'dodeljena') || []
    var zavrsene = ture?.filter((t: any) => t.status === 'zavrsena') || []
    var naCekanju = ture?.filter((t: any) => t.status === 'na_cekanju') || []
    var odbijene = ture?.filter((t: any) => t.status === 'odbijena') || []
  }

  // Statistike
  const ukupnoTura = zavrsene.length
  const aktivneTure = dodeljene.length

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

        {/* Osnovne informacije */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Truck className="h-6 w-6 text-primary" />
                  {korisnik.puno_ime || korisnik.naziv_firme}
                </CardTitle>
                <CardDescription>
                  {jeVozac ? 'Detaljan pregled vozača' : 'Detaljan pregled poslodavca'}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2">
                  {korisnik.blokiran ? (
                    <Badge variant="destructive">Blokiran</Badge>
                  ) : (
                    <Badge variant="default">Aktivan</Badge>
                  )}
                  {korisnik.verifikovan && (
                    <Badge variant="secondary">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verifikovan
                    </Badge>
                  )}
                </div>
                <PosaljiNotifikacijuDialog
                  korisnikId={korisnik.id}
                  korisnikIme={korisnik.puno_ime || korisnik.naziv_firme}
                  korisnikUloga={korisnik.uloga as 'vozac' | 'poslodavac'}
                />
                {jeVozac && (
                  <ToggleBlokiranjeButton
                    userId={korisnik.id}
                    userName={korisnik.puno_ime}
                    blokiran={korisnik.blokiran}
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{korisnik.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Telefon:</span>
                  <span>{korisnik.telefon}</span>
                </div>
                {jeVozac && korisnik.registarske_tablice && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Registarske tablice:</span>
                    <span>{korisnik.registarske_tablice}</span>
                  </div>
                )}
                {!jeVozac && korisnik.naziv_firme && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Naziv firme:</span>
                    <span>{korisnik.naziv_firme}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Registrovan:</span>
                  <span>{new Date(korisnik.created_at).toLocaleDateString('sr-RS')}</span>
                </div>
                {korisnik.grad && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Grad:</span>
                    <span>{korisnik.grad}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistike */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {jeVozac ? 'Aktivne ture' : 'Dodeljene ture'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{aktivneTure}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Završene ture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{ukupnoTura}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Na čekanju
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{naCekanju.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Odbijene
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{odbijene.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Aktivne/Dodeljene ture */}
        {dodeljene.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {jeVozac 
                  ? `Trenutno dodeljene ture (${dodeljene.length})`
                  : `Dodeljene ture (${dodeljene.length})`
                }
              </CardTitle>
              <CardDescription>
                {jeVozac 
                  ? 'Ture koje su trenutno dodeljene ovom vozaču'
                  : 'Ture koje su dodeljene vozačima'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jeVozac ? (
                  dodeljene.map((prijava: any) => (
                    <div key={prijava.id} className="border rounded-lg p-4 bg-blue-50/50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold text-lg">
                            {prijava.tura.polazak} → {prijava.tura.destinacija}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(prijava.tura.datum).toLocaleDateString('sr-RS')}
                            </span>
                            <span className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {prijava.tura.opis_robe}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="default">
                              {prijava.tura.status === 'dodeljena' ? 'Dodeljena' : 'Aktivna'}
                            </Badge>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/ture/${prijava.tura.id}`}>
                                Pogledaj detalje ture
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {prijava.tura.ponudjena_cena} €
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  dodeljene.map((tura: any) => (
                    <div key={tura.id} className="border rounded-lg p-4 bg-blue-50/50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold text-lg">
                            {tura.polazak} → {tura.destinacija}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(tura.datum).toLocaleDateString('sr-RS')}
                            </span>
                            <span className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {tura.opis_robe}
                            </span>
                          </div>
                          {tura.vozac && (
                            <p className="text-sm text-blue-700 font-semibold">
                              🚚 Vozač: {tura.vozac.puno_ime} ({tura.vozac.registarske_tablice})
                            </p>
                          )}
                          <div className="flex gap-2 items-center">
                            <Badge variant="default">Dodeljena</Badge>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/ture/${tura.id}`}>
                                Pogledaj detalje ture
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {tura.ponudjena_cena} €
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ture/Prijave na čekanju */}
        {naCekanju.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                {jeVozac 
                  ? `Prijave na čekanju (${naCekanju.length})`
                  : `Ture na čekanju (${naCekanju.length})`
                }
              </CardTitle>
              <CardDescription>
                {jeVozac 
                  ? 'Prijave koje čekaju odobrenje'
                  : 'Ture koje čekaju odobrenje admina'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jeVozac ? (
                  naCekanju.map((prijava: any) => (
                    <div key={prijava.id} className="border rounded-lg p-4 bg-yellow-50/50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold text-lg">
                            {prijava.tura.polazak} → {prijava.tura.destinacija}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(prijava.tura.datum).toLocaleDateString('sr-RS')}
                            </span>
                            <span className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {prijava.tura.opis_robe}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <p className="text-xs text-gray-500">
                              Prijavljen: {new Date(prijava.created_at).toLocaleDateString('sr-RS')}
                            </p>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/ture/${prijava.tura.id}`}>
                                Pogledaj detalje ture
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {prijava.tura.ponudjena_cena} €
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  naCekanju.map((tura: any) => (
                    <div key={tura.id} className="border rounded-lg p-4 bg-yellow-50/50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold text-lg">
                            {tura.polazak} → {tura.destinacija}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(tura.datum).toLocaleDateString('sr-RS')}
                            </span>
                            <span className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {tura.opis_robe}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <p className="text-xs text-gray-500">
                              Objavljena: {new Date(tura.created_at).toLocaleDateString('sr-RS')}
                            </p>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/ture/${tura.id}`}>
                                Pogledaj detalje ture
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {tura.ponudjena_cena} €
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Završene ture */}
        {zavrsene.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Završene ture ({zavrsene.length})
              </CardTitle>
              <CardDescription>
                {jeVozac 
                  ? 'Istorija uspešno izvezenih tura'
                  : 'Istorija završenih tura'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jeVozac ? (
                  <>
                    {zavrsene.slice(0, 10).map((prijava: any) => (
                      <div key={prijava.id} className="border rounded-lg p-4 bg-green-50/50 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">
                              {prijava.tura.polazak} → {prijava.tura.destinacija}
                            </h3>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(prijava.tura.datum).toLocaleDateString('sr-RS')}
                              </span>
                              <span className="flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                {prijava.tura.opis_robe}
                              </span>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/ture/${prijava.tura.id}`}>
                                Pogledaj detalje ture
                              </Link>
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              {prijava.tura.ponudjena_cena} €
                            </div>
                            <p className="text-xs text-green-600">✓ Završena</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {zavrsene.length > 10 && (
                      <p className="text-center text-sm text-gray-500 pt-2">
                        ... i još {zavrsene.length - 10} završenih tura
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {zavrsene.slice(0, 10).map((tura: any) => (
                      <div key={tura.id} className="border rounded-lg p-4 bg-green-50/50 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">
                              {tura.polazak} → {tura.destinacija}
                            </h3>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(tura.datum).toLocaleDateString('sr-RS')}
                              </span>
                              <span className="flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                {tura.opis_robe}
                              </span>
                            </div>
                            {tura.vozac && (
                              <p className="text-sm text-green-700 font-semibold">
                                🚚 Vozač: {tura.vozac.puno_ime}
                              </p>
                            )}
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/ture/${tura.id}`}>
                                Pogledaj detalje ture
                              </Link>
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              {tura.ponudjena_cena} €
                            </div>
                            <p className="text-xs text-green-600">✓ Završena</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {zavrsene.length > 10 && (
                      <p className="text-center text-sm text-gray-500 pt-2">
                        ... i još {zavrsene.length - 10} završenih tura
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nema podataka */}
        {!dodeljene.length && !naCekanju.length && !zavrsene.length && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {jeVozac 
                    ? 'Ovaj vozač još nema aktivnosti'
                    : 'Ovaj poslodavac još nema aktivnosti'
                  }
                </p>
                <p className="text-sm">
                  {jeVozac 
                    ? 'Nije se prijavio niti izvezao nijednu turu'
                    : 'Nije objavio niti dodelio nijednu turu'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

