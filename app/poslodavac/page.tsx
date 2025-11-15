import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { DashboardContent } from '@/components/poslodavac/dashboard-content'

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

    // Ture poslodavca (samo potrebne kolone, limit 50)
    supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, status, created_at,
        prijave:prijave(count),
        vozac:users!ture_dodeljeni_vozac_id_fkey(puno_ime)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} currentPage="dashboard" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Dobrodošli, {userData.profile.puno_ime}!
          </h1>
          <p className="text-gray-600">
            Pronađite vozače za svoje ture
          </p>
        </div>

        {/* Dashboard content sa real-time */}
        <DashboardContent 
          initialData={{
            aktivneTure: aktivneTure || 0,
            završeneTure: završeneTure || 0,
            ukupnoPrijava: ukupnoPrijava || 0,
            ture: ture || []
          }}
          userId={userData.user.id}
        />
      </div>
    </div>
  )
}

