import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { NotifikacijeContent } from '@/components/vozac/notifikacije-content'

export const revalidate = 0

export default async function NotifikacijePage() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'vozac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Učitaj notifikacije
  const { data: notifikacije } = await supabase
    .from('notifikacije')
    .select(`
      id, tip, poruka, procitano, created_at,
      prijava:prijave(
        id,
        tura:ture(id, polazak, destinacija, datum, ponudjena_cena)
      )
    `)
    .eq('vozac_id', userData.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} currentPage="notifikacije" />

      <div className="container mx-auto px-4 py-8">
        <NotifikacijeContent 
          initialNotifikacije={(notifikacije as any) || []}
          userId={userData.user.id}
        />
      </div>
    </div>
  )
}
