import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, TruckIcon, CheckCircle, XCircle, Clock, Euro } from 'lucide-react'
import { PrijaveList } from '@/components/admin/prijave-list'
import { UplateList } from '@/components/admin/uplate-list'
import { KorisniciList } from '@/components/admin/korisnici-list'
import { TureApprovalList } from '@/components/admin/ture-approval-list'
import Link from 'next/link'

// Cache strategija - revalidate svakih 30 sekundi
export const revalidate = 30

export default async function AdminDashboard() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'admin') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // OPTIMIZED: Paralelno učitavanje samo potrebnih podataka
  const [
    { count: ukupnoKorisnika },
    { count: vozaci },
    { count: firme },
    { count: blokiraniKorisnici },
    { data: prijave, count: cekaPrijave },
    { data: tureNaCekanju, count: cekaTure },
    { data: tureDodeljene, count: cekaDodeljene },
    { data: uplateStats },
    { data: korisnici },
    { data: sveTure },
    { data: uplate }
  ] = await Promise.all([
    // Statistike sa COUNT (brzo)
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('uloga', 'vozac'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('uloga', 'poslodavac'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('blokiran', true),
    
    // Prijave na čekanju (potrebne za tab)
    supabase
      .from('prijave')
      .select(`
        id, created_at, status,
        tura:ture(id, polazak, destinacija, datum, ponudjena_cena),
        vozac:users!prijave_vozac_id_fkey(id, puno_ime, email, telefon, registarske_tablice, blokiran)
      `, { count: 'exact' })
      .eq('status', 'ceka_admina')
      .order('created_at', { ascending: false })
      .limit(50),
    
    // Ture na čekanju (potrebne za tab)
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, status, created_at,
        firma:users!ture_firma_id_fkey(id, puno_ime, naziv_firme, email, telefon)
      `, { count: 'exact' })
      .eq('status', 'na_cekanju')
      .order('created_at', { ascending: false })
      .limit(50),
    
    // Dodeljene ture (potrebne za tab)
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, status, created_at, dodeljeni_vozac_id,
        firma:users!ture_firma_id_fkey(id, puno_ime, naziv_firme, email, telefon),
        vozac:users!ture_dodeljeni_vozac_id_fkey(id, puno_ime, email, telefon, registarske_tablice)
      `, { count: 'exact' })
      .eq('status', 'dodeljena')
      .order('datum', { ascending: true })
      .limit(50),
    
    // Samo suma uplata (ne sve uplate)
    supabase
      .from('uplate')
      .select('iznos')
      .eq('status', 'placeno'),
    
    // Korisnici (samo za tab, limit 100)
    supabase
      .from('users')
      .select('id, puno_ime, email, telefon, uloga, naziv_firme, registarske_tablice, verifikovan, blokiran, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    
    // Sve ture (samo za tab, limit 100)
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, status, created_at,
        firma:users!ture_firma_id_fkey(puno_ime, naziv_firme),
        vozac:users!ture_dodeljeni_vozac_id_fkey(puno_ime, registarske_tablice)
      `)
      .order('created_at', { ascending: false })
      .limit(100),
    
    // Uplate (samo za tab, limit 50)
    supabase
      .from('uplate')
      .select(`
        id, iznos, status, created_at,
        vozac:users!uplate_vozac_id_fkey(id, puno_ime, email, registarske_tablice),
        tura:ture(id, polazak, destinacija, datum)
      `)
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  const ukupnoUplata = uplateStats?.reduce((sum: number, u: any) => 
    sum + parseFloat(u.iznos), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Upravljanje korisnicima, turama i uplatama
          </p>
        </div>

        {/* Statistike */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupno korisnika</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ukupnoKorisnika}</div>
              <p className="text-xs text-muted-foreground">
                {vozaci} vozača, {firme} firmi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prijave za odobrenje</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{cekaPrijave}</div>
              <p className="text-xs text-muted-foreground">
                Čeka se vaše odobrenje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blokirani nalozi</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{blokiraniKorisnici}</div>
              <p className="text-xs text-muted-foreground">
                Nalozi sa neplaćenim provizijama
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupne uplate</CardTitle>
              <Euro className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {ukupnoUplata.toFixed(2)} €
              </div>
              <p className="text-xs text-muted-foreground">
                Plaćene provizije
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prijave" className="space-y-4">
          <TabsList>
            <TabsTrigger value="prijave" className="relative">
              Prijave vozača
              {cekaPrijave > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {cekaPrijave}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ture-cekanje" className="relative">
              Ture na čekanju
              {cekaTure > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {cekaTure}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ture-dodeljene">Dodeljene ture</TabsTrigger>
            <TabsTrigger value="ture">Sve ture</TabsTrigger>
            <TabsTrigger value="uplate">Uplate</TabsTrigger>
            <TabsTrigger value="korisnici">Korisnici</TabsTrigger>
          </TabsList>

          <TabsContent value="prijave" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prijave za odobrenje</CardTitle>
                <CardDescription>
                  Pregledajte i odobrite vozače za ture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PrijaveList prijave={prijave || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ture-cekanje" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ture koje čekaju odobrenje</CardTitle>
                <CardDescription>
                  Pregledajte i odobrite nove ture od poslodavaca
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TureApprovalList ture={tureNaCekanju || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ture-dodeljene" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dodeljene ture</CardTitle>
                <CardDescription>
                  Pregledajte dodeljene ture - ko vozi, kontakt podaci, slanje notifikacija
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tureDodeljene && tureDodeljene.length > 0 ? (
                    tureDodeljene.map((tura: any) => (
                      <Link key={tura.id} href={`/admin/ture/${tura.id}`}>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">
                                {tura.polazak} → {tura.destinacija}
                              </h3>
                              <p className="text-sm text-gray-600">
                                📅 {new Date(tura.datum).toLocaleDateString('sr-RS')} | 💰 {tura.ponudjena_cena} €
                              </p>
                              <p className="text-sm">
                                🏢 Poslodavac: {tura.firma?.naziv_firme || tura.firma?.puno_ime}
                              </p>
                              {tura.vozac && (
                                <p className="text-sm font-semibold text-blue-600">
                                  🚚 Vozač: {tura.vozac.puno_ime} ({tura.vozac.registarske_tablice})
                                </p>
                              )}
                            </div>
                            <span className="text-blue-600">🔵 Dodeljena</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">Nema dodeljenih tura</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ture" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sve ture</CardTitle>
                <CardDescription>
                  Pregled svih tura - ko, kad, šta je vozio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sveTure && sveTure.length > 0 ? (
                    sveTure.map((tura: any) => (
                      <div key={tura.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">
                              {tura.polazak} → {tura.destinacija}
                            </h3>
                            <p className="text-sm text-gray-600">
                              📅 {new Date(tura.datum).toLocaleDateString('sr-RS')} | 💰 {tura.ponudjena_cena} €
                            </p>
                            <p className="text-sm">
                              🏢 Firma: {tura.firma?.naziv_firme || tura.firma?.puno_ime}
                            </p>
                            {tura.vozac && (
                              <p className="text-sm">
                                🚚 Vozač: {tura.vozac.puno_ime} ({tura.vozac.registarske_tablice})
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Kreirano: {new Date(tura.created_at).toLocaleDateString('sr-RS')}
                            </p>
                          </div>
                          <div>
                            {tura.status === 'aktivna' && <span className="text-green-600">🟢 Aktivna</span>}
                            {tura.status === 'dodeljena' && <span className="text-blue-600">🔵 Dodeljena</span>}
                            {tura.status === 'zavrsena' && <span className="text-gray-600">✅ Završena</span>}
                            {tura.status === 'odbijena' && <span className="text-red-600">❌ Odbijena</span>}
                            {tura.status === 'na_cekanju' && <span className="text-orange-600">⏳ Na čekanju</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">Nema tura</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uplate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Istorija uplata</CardTitle>
                <CardDescription>
                  Pregled svih uplata provizija
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UplateList uplate={uplate || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="korisnici" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Svi korisnici</CardTitle>
                <CardDescription>
                  Upravljanje korisnicima platforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KorisniciList korisnici={korisnici || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

