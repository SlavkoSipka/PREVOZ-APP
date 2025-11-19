import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { DashboardContent } from '@/components/vozac/dashboard-content'
import { EnableNotificationsBanner } from '@/components/push-notifications/enable-notifications-banner'
import { BlokiranBanner } from '@/components/vozac/blokiran-banner'
import { HelpCard } from '@/components/support/help-card'

// Onemogući cache za real-time
export const revalidate = 0

export default async function VozacDashboard() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'vozac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // OPTIMIZED: Paralelno učitavanje
  const [
    { data: ture },
    { data: prijave },
    { data: odbijenePrijave },
    { count: brojZavrsenihTura },
    { data: zavrseneTure },
    { data: uplate }
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
      .limit(10),

    // Neplaćene uplate
    supabase
      .from('uplate')
      .select('iznos')
      .eq('vozac_id', userData.user.id)
      .eq('status', 'u_toku')
  ])

  // Izračunaj ukupan dug
  const ukupnoDug = uplate?.reduce((sum: number, u: any) => sum + parseFloat(u.iznos), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-6">
        {/* Upozorenje ako je vozač blokiran */}
        {userData.profile.blokiran && (
          <BlokiranBanner ukupnoDug={ukupnoDug} />
        )}

        {/* Push Notifications Banner */}
        <EnableNotificationsBanner userId={userData.user.id} />

        {/* Pomoć banner - iznad dashboard-a */}
        <div className="mb-6">
          <HelpCard />
        </div>

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

