import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Truck, Calendar, Shield, ArrowLeft, TruckIcon, Euro, CheckCircle, XCircle, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default async function VozacProfilPage() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'vozac') {
    redirect('/prijava')
  }

  const profile = userData.profile
  const supabase = await createServerSupabaseClient()

  // Učitaj statistike vozača
  const [
    { count: zavrseneTure },
    { count: aktivnePrijave },
    { data: uplate },
    { data: poslednjeTure },
    { data: ocene }
  ] = await Promise.all([
    // Broj završenih tura
    supabase
      .from('ture')
      .select('*', { count: 'exact', head: true })
      .eq('dodeljeni_vozac_id', userData.user.id)
      .eq('status', 'zavrsena'),

    // Broj aktivnih prijava
    supabase
      .from('prijave')
      .select('*', { count: 'exact', head: true })
      .eq('vozac_id', userData.user.id)
      .in('status', ['ceka_admina', 'odobreno']),

    // Uplate (plaćene i neplaćene)
    supabase
      .from('uplate')
      .select('iznos, status')
      .eq('vozac_id', userData.user.id),

    // Poslednje 5 tura
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, ponudjena_cena, status, created_at,
        firma:users!ture_firma_id_fkey(puno_ime, naziv_firme)
      `)
      .eq('dodeljeni_vozac_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(5),

    // Ocene vozača
    supabase
      .from('ocene')
      .select(`
        id, ocena, komentar, created_at,
        poslodavac:users!ocene_poslodavac_id_fkey(puno_ime, naziv_firme),
        tura:ture(polazak, destinacija, datum)
      `)
      .eq('vozac_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  // Izračunaj statistike
  const ukupnaZarada = uplate
    ?.filter((u: any) => u.status === 'placeno')
    .reduce((sum: number, u: any) => sum + parseFloat(u.iznos), 0) || 0
  
  const neplaceneProvizije = uplate
    ?.filter((u: any) => u.status !== 'placeno')
    .reduce((sum: number, u: any) => sum + parseFloat(u.iznos), 0) || 0

  // Izračunaj prosečnu ocenu
  const prosecnaOcena = ocene && ocene.length > 0
    ? (ocene.reduce((sum: number, o: any) => sum + o.ocena, 0) / ocene.length).toFixed(1)
    : null
  
  const brojOcena = ocene?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/vozac">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Link>
        </Button>

        {/* Header sa statistikama */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{profile.puno_ime}</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                {profile.registarske_tablice}
              </p>
            </div>
            <Badge className={`${profile.verifikovan ? 'bg-green-500' : 'bg-yellow-500'} text-white px-4 py-2 text-base`}>
              {profile.verifikovan ? '✅ Verifikovan vozač' : '⏳ Čeka verifikaciju'}
            </Badge>
          </div>

          {/* Statistike */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {prosecnaOcena && (
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <Star className="h-6 w-6 mb-2 text-yellow-300 fill-yellow-300" />
                <p className="text-2xl font-bold">{prosecnaOcena}</p>
                <p className="text-xs text-blue-200">Prosečna ocena</p>
                <p className="text-xs text-blue-100">({brojOcena} {brojOcena === 1 ? 'ocena' : brojOcena < 5 ? 'ocene' : 'ocena'})</p>
              </div>
            )}
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <TruckIcon className="h-6 w-6 mb-2 text-blue-200" />
              <p className="text-2xl font-bold">{zavrseneTure}</p>
              <p className="text-sm text-blue-100">Izvezenih tura</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <Clock className="h-6 w-6 mb-2 text-blue-200" />
              <p className="text-2xl font-bold">{aktivnePrijave}</p>
              <p className="text-sm text-blue-100">Aktivne prijave</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <Euro className="h-6 w-6 mb-2 text-green-300" />
              <p className="text-2xl font-bold">{ukupnaZarada.toFixed(2)}€</p>
              <p className="text-sm text-blue-100">Ukupna zarada</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <XCircle className="h-6 w-6 mb-2 text-red-300" />
              <p className="text-2xl font-bold">{neplaceneProvizije.toFixed(2)}€</p>
              <p className="text-sm text-blue-100">Neplaćene provizije</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Status naloga - prioritet ako je blokiran */}
          {profile.blokiran && (
            <Card className="border-red-500 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  ⚠️ Nalog je blokiran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-900 mb-2">Razlog blokiranja:</p>
                    <p className="text-sm text-red-800">{profile.razlog_blokiranja || 'Neplaćena provizija. Kontaktirajte administratora.'}</p>
                  </div>
                  {neplaceneProvizije > 0 && (
                    <div className="bg-white border border-red-200 rounded-lg p-4">
                      <p className="font-semibold text-red-900 mb-2">💰 Neplaćena provizija:</p>
                      <p className="text-2xl font-bold text-red-700">{neplaceneProvizije.toFixed(2)}€</p>
                    </div>
                  )}
                  <Button asChild variant="destructive" size="lg" className="w-full">
                    <Link href="/uplata-obavezna">
                      Plati proviziju i deblokiraj nalog
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Poslednje ture */}
          {poslednjeTure && poslednjeTure.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" />
                  Vaše poslednje ture
                </CardTitle>
                <CardDescription>
                  Pregled poslednjih {poslednjeTure.length} tura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {poslednjeTure.map((tura: any) => (
                  <div key={tura.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{tura.polazak} → {tura.destinacija}</h4>
                        <p className="text-sm text-gray-600">{tura.firma?.naziv_firme || tura.firma?.puno_ime}</p>
                      </div>
                      <Badge className={
                        tura.status === 'zavrsena' ? 'bg-green-100 text-green-800' :
                        tura.status === 'dodeljena' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {tura.status === 'zavrsena' ? '✅ Završena' :
                         tura.status === 'dodeljena' ? '🔵 Dodeljena' :
                         '🟡 Aktivna'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {new Date(tura.datum).toLocaleDateString('sr-RS')}
                      </span>
                      <span className="font-bold text-green-600">{tura.ponudjena_cena}€</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Osnovne informacije */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Osnovne informacije</CardTitle>
              <CardDescription>
                Vaši lični podaci i informacije o nalogu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ime i prezime</p>
                    <p className="font-semibold">{profile.puno_ime}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefon</p>
                    <p className="font-semibold">{profile.telefon}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Truck className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registarske tablice</p>
                    <p className="font-semibold">{profile.registarske_tablice}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Član od</p>
                    <p className="font-semibold">
                      {new Date(profile.created_at).toLocaleDateString('sr-RS')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Shield className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status verifikacije</p>
                    <p className={`font-semibold ${profile.verifikovan ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profile.verifikovan ? '✅ Verifikovan' : '⏳ Na čekanju'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ocene */}
          {ocene && ocene.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  Ocene poslodavaca
                </CardTitle>
                <CardDescription>
                  Ocene koje ste dobili od poslodavaca za izvezene ture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ocene.map((ocena: any) => (
                    <div key={ocena.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Zvezde */}
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= ocena.ocena
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                              {ocena.ocena}/5
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {ocena.poslodavac?.naziv_firme || ocena.poslodavac?.puno_ime}
                          </p>
                          {ocena.tura && (
                            <p className="text-xs text-gray-500 mt-1">
                              {ocena.tura.polazak} → {ocena.tura.destinacija} • {' '}
                              {new Date(ocena.tura.datum).toLocaleDateString('sr-RS')}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(ocena.created_at).toLocaleDateString('sr-RS')}
                        </span>
                      </div>
                      {ocena.komentar && (
                        <div className="bg-white rounded p-3 border-l-4 border-blue-400">
                          <p className="text-sm text-gray-700 italic">"{ocena.komentar}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Akcije */}
          <Card>
            <CardHeader>
              <CardTitle>Podešavanja</CardTitle>
              <CardDescription>
                Upravljanje nalogom i dokumentima
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Ažuriraj profil
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Promeni lozinku
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Upload dokumenata
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

