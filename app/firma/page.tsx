import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Calendar, Package, Euro, Users } from 'lucide-react'
import Link from 'next/link'

// Cache strategija - revalidate svakih 30 sekundi
export const revalidate = 30

export default async function FirmaDashboard() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // OPTIMIZED: Paralelno učitavanje sa COUNT
  const [
    { count: aktivneTure },
    { count: završeneTure },
    { data: turaIds },
    { data: ture }
  ] = await Promise.all([
    // COUNT aktivnih tura
    supabase
      .from('ture')
      .select('*', { count: 'exact', head: true })
      .eq('firma_id', userData.user.id)
      .eq('status', 'aktivna'),

    // COUNT završenih tura
    supabase
      .from('ture')
      .select('*', { count: 'exact', head: true })
      .eq('firma_id', userData.user.id)
      .eq('status', 'zavrsena'),

    // Prvo uzmi IDs svih tura
    supabase
      .from('ture')
      .select('id')
      .eq('firma_id', userData.user.id),

    // Ture firme (samo potrebne kolone, limit 50)
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, status, created_at,
        prijave:prijave(count)
      `)
      .eq('firma_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  // Broj prijava za sve ture (ako ima IDs)
  let ukupnoPrijava = 0
  if (turaIds && turaIds.length > 0) {
    const { count } = await supabase
      .from('prijave')
      .select('id', { count: 'exact', head: true })
      .in('tura_id', turaIds.map((t: any) => t.id))
    
    ukupnoPrijava = count || 0
  }

  const statusLabels: { [key: string]: string } = {
    aktivna: '🟢 Aktivna',
    na_cekanju: '🟡 Na čekanju',
    dodeljena: '🔵 Dodeljena',
    zavrsena: '✅ Završena',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData.profile} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Dobrodošli, {userData.profile.puno_ime}!
            </h1>
            <p className="text-gray-600">
              Upravljajte vašim turama i pronađite vozače
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/firma/objavi-turu">
              <Plus className="mr-2 h-5 w-5" />
              Objavi novu turu
            </Link>
          </Button>
        </div>

        {/* Statistike */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktivne ture</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aktivneTure}</div>
              <p className="text-xs text-muted-foreground">
                Trenutno aktivnih tura
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Završene ture</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{završeneTure}</div>
              <p className="text-xs text-muted-foreground">
                Ukupno realizovano
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prijave vozača</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ukupnoPrijava}</div>
              <p className="text-xs text-muted-foreground">
                Ukupno prijavljenih vozača
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista tura */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Vaše ture</h2>
          
          {!ture || ture.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Još niste objavili nijednu turu</p>
                <Button asChild>
                  <Link href="/firma/objavi-turu">
                    <Plus className="mr-2 h-4 w-4" />
                    Objavi prvu turu
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ture.map((tura: any) => (
                <Card key={tura.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {tura.polazak} → {tura.destinacija}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(tura.datum).toLocaleDateString('sr-RS')}
                          </span>
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            {tura.opis_robe}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {tura.prijave?.[0]?.count || 0} prijava
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {tura.ponudjena_cena} €
                        </div>
                        <span className="text-sm font-medium">
                          {statusLabels[tura.status]}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/firma/ture/${tura.id}`}>
                          Pogledaj detalje
                        </Link>
                      </Button>
                      {tura.status === 'aktivna' && (
                        <Button asChild size="sm">
                          <Link href={`/firma/ture/${tura.id}/prijave`}>
                            Pregledaj prijave ({tura.prijave?.[0]?.count || 0})
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

