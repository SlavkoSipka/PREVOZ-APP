import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NotifikacijeContentPoslodavac } from '@/components/poslodavac/notifikacije-content'

export default async function PoslodavacNotifikacijePage() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  const { data: notifikacije } = await supabase
    .from('notifikacije')
    .select(`
      id, tip, poruka, procitano, created_at, tura_id,
      tura:ture(
        id, polazak, destinacija, datum, ponudjena_cena, dodeljeni_vozac_id,
        dodeljeni_vozac:users!ture_dodeljeni_vozac_id_fkey(id, puno_ime)
      ),
      ocene(id, ocena)
    `)
    .eq('vozac_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData.profile} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/poslodavac">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Bell className="mr-2 h-6 w-6" />
              Notifikacije
            </CardTitle>
            <CardDescription>
              Pregled vaših obaveštenja i poruka
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotifikacijeContentPoslodavac
              initialNotifikacije={(notifikacije as any) || []}
              userId={userData.user.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

