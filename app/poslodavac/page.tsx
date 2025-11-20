import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { DashboardContent } from '@/components/poslodavac/dashboard-content'
import { EnableNotificationsBanner } from '@/components/push-notifications/enable-notifications-banner'

// Onemogući cache za real-time
export const revalidate = 0

export default async function PoslodavacDashboard() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // OPTIMIZED: Paralelno učitavanje sa COUNT
  const [
    { count: aktivneTure },
    { count: završeneTure },
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

    // Ture poslodavca (samo potrebne kolone, limit 50)
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, status, created_at, dodeljeni_vozac_id,
        vozac:users!ture_dodeljeni_vozac_id_fkey(id, puno_ime),
        ocene(id, ocena, komentar)
      `)
      .eq('firma_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} currentPage="dashboard" />

      <div className="container mx-auto px-4 py-6">
        {/* Push Notifications Banner */}
        <EnableNotificationsBanner userId={userData.user.id} />

        {/* Dashboard content sa real-time */}
        <DashboardContent 
          initialData={{
            aktivneTure: aktivneTure || 0,
            završeneTure: završeneTure || 0,
            ture: ture || []
          }}
          userId={userData.user.id}
        />
      </div>
    </div>
  )
}

