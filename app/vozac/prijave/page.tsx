import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { MojePrijaveContent } from '@/components/vozac/moje-prijave-content'

// Onemogući cache za real-time
export const revalidate = 0

export default async function VozacPrijavePage() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'vozac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Učitaj sve prijave vozača
  const { data: prijave } = await supabase
    .from('prijave')
    .select(`
      id, status, created_at, razlog_odbijanja,
      tura:ture(
        id, polazak, destinacija, datum, ponudjena_cena, opis_robe, status, vreme_polaska,
        firma:users!ture_firma_id_fkey(puno_ime, naziv_firme)
      )
    `)
    .eq('vozac_id', userData.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} currentPage="prijave" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Moje prijave
          </h1>
          <p className="text-gray-600">
            Pregled svih vaših prijava na ture
          </p>
        </div>

        {/* Info poruka */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Važno:</strong> Nakon izvezene ture obavezno potvrdite da je tura završena klikom na dugme "Završio sam turu". 
            To je neophodno kako biste mogli da prihvatate nove ture.
          </p>
        </div>

        {/* Prijave content sa tabovima */}
        <MojePrijaveContent
          initialPrijave={(prijave as any) || []}
          userId={userData.user.id}
        />
      </div>
    </div>
  )
}
