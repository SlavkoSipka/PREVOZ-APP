import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { DashboardContent } from '@/components/vozac/dashboard-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

// Onemogući cache za real-time
export const revalidate = 0

export default async function VozacDashboard() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'vozac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Proveri da li vozač treba da bude blokiran zbog propuštenih tura
  await supabase.rpc('proveri_sve_odobrene_ture_vozaca', {
    p_vozac_id: userData.user.id
  })

  // OPTIMIZED: Paralelno učitavanje
  const [
    { data: ture },
    { data: prijave },
    { data: odbijenePrijave },
    { count: brojZavrsenihTura },
    { data: zavrseneTure }
  ] = await Promise.all([
    // Aktivne ture - default sortiranje po najnovijim (created_at DESC)
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, vreme_polaska, faktura, created_at,
        firma:users!ture_firma_id_fkey(puno_ime, naziv_firme)
      `)
      .eq('status', 'aktivna')
      .order('created_at', { ascending: false })
      .limit(20),

    // Prijave vozača (samo aktivne - ne završene ture)
    supabase
      .from('prijave')
      .select(`
        id, status, created_at,
        tura:ture(id, polazak, destinacija, datum, ponudjena_cena, opis_robe, status, vreme_polaska)
      `)
      .eq('vozac_id', userData.user.id)
      .in('status', ['ceka_admina', 'odobreno'])
      .limit(50),

    // Odbijene prijave
    supabase
      .from('prijave')
      .select(`
        id, status, created_at, razlog_odbijanja,
        tura:ture(id, polazak, destinacija, datum, ponudjena_cena, opis_robe, status, vreme_polaska)
      `)
      .eq('vozac_id', userData.user.id)
      .eq('status', 'odbijeno')
      .order('created_at', { ascending: false })
      .limit(10),

    // Samo COUNT završenih tura
    supabase
      .from('ture')
      .select('*', { count: 'exact', head: true })
      .eq('dodeljeni_vozac_id', userData.user.id)
      .eq('status', 'zavrsena'),

    // Završene ture (limit 10 za tab)
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, ponudjena_cena, created_at,
        firma:users!ture_firma_id_fkey(puno_ime, naziv_firme),
        uplata:uplate(status)
      `)
      .eq('dodeljeni_vozac_id', userData.user.id)
      .eq('status', 'zavrsena')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Dobrodošao, {userData.profile.puno_ime}!
          </h1>
          <p className="text-gray-600">
            Pronađi i prihvati ture koje ti odgovaraju
          </p>
        </div>

        {/* Upozorenje ako je vozač blokiran */}
        {userData.profile.blokiran && (
          <Card className="mb-8 border-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                ⚠️ Nalog je blokiran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 mb-3">
                <strong>Razlog:</strong> {userData.profile.razlog_blokiranja || 'Kontaktirajte administratora'}
              </p>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold mb-2 text-red-900">📢 Važno:</h4>
                <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                  <li>Ne možete se prijavljivati za nove ture dok ne platite proviziju</li>
                  <li>Provizija se plaća nakon završetka svake odobrene ture</li>
                  <li>Kontaktirajte administratora za više informacija</li>
                </ul>
              </div>
              {zavrseneTure && zavrseneTure.length > 0 && zavrseneTure.some((t: any) => 
                t.uplata && t.uplata.length > 0 && t.uplata[0].status !== 'placeno'
              ) && (
                <Link href="/uplata-obavezna">
                  <Button variant="destructive" className="mt-4">
                    Plati proviziju i deblokiraj nalog
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dashboard content sa real-time */}
        <DashboardContent 
          initialData={{
            ture: ture || [],
            prijave: prijave || [],
            odbijenePrijave: odbijenePrijave || [],
            brojZavrsenihTura: brojZavrsenihTura || 0,
            zavrseneTure: zavrseneTure || [],
            userProfile: userData.profile
          }}
          userId={userData.user.id}
        />
      </div>
    </div>
  )
}

