import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function FirmaNotifikacijePage() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  const { data: notifikacije } = await supabase
    .from('notifikacije')
    .select('*')
    .eq('vozac_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData.profile} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/firma">
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
            {!notifikacije || notifikacije.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nemate novih notifikacija
              </div>
            ) : (
              <div className="space-y-3">
                {notifikacije.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border ${
                      notif.procitano ? 'bg-white' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        {notif.tip === 'odobreno' 
                          ? 'Prijava odobrena' 
                          : notif.tip === 'odbijeno'
                          ? 'Prijava odbijena'
                          : notif.tip === 'nova_ocena'
                          ? 'Nova ocena'
                          : notif.tip === 'uplata_potrebna'
                          ? 'Uplata provizije'
                          : notif.tip === 'admin_poruka'
                          ? '📬 Poruka od administratora'
                          : 'Notifikacija'
                        }
                      </h3>
                      {!notif.procitano && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          Novo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notif.poruka}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleString('sr-RS')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

