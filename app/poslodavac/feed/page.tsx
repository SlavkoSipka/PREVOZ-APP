import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { FeedContent } from '@/components/poslodavac/feed-content'
import { HelpCard } from '@/components/support/help-card'

// Onemogući cache za real-time
export const revalidate = 0

export default async function PoslodavacFeed() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Učitaj inicijalne ture - default sortiranje po najnovijim (created_at DESC)
  const { data: initialTure } = await supabase
    .from('ture')
    .select(`
      id, polazak, destinacija, datum, opis_robe, ponudjena_cena, vreme_polaska, status, created_at, firma_id, faktura,
      firma:users!ture_firma_id_fkey(puno_ime, naziv_firme),
      prijave:prijave(count)
    `)
    .in('status', ['aktivna', 'dodeljena'])
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} currentPage="feed" />

      <div className="container mx-auto px-4 py-6">
        {/* Pomoć banner - iznad svega */}
        <div className="mb-6">
          <HelpCard />
        </div>
        
        {/* Lista tura sa real-time */}
        <FeedContent initialTure={initialTure || []} userId={userData.user.id} />
      </div>
    </div>
  )
}

