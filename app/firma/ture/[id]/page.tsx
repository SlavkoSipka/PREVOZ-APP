import { redirect, notFound } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Package, Euro, ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function FirmaTuraDetaljiPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15)
  const { id } = await params
  
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  const { data: tura, error } = await supabase
    .from('ture')
    .select(`
      *,
      vozac:users!ture_dodeljeni_vozac_id_fkey(puno_ime, telefon, email)
    `)
    .eq('id', id)
    .eq('firma_id', userData.user.id)
    .single()

  if (error || !tura) {
    notFound()
  }

  const { data: prijave } = await supabase
    .from('prijave')
    .select('*')
    .eq('tura_id', id)

  const statusLabels: { [key: string]: string } = {
    aktivna: '🟢 Aktivna',
    na_cekanju: '🟡 Na čekanju',
    dodeljena: '🔵 Dodeljena',
    zavrsena: '✅ Završena',
  }

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

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {tura.polazak} → {tura.destinacija}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Status: <span className="font-semibold">{statusLabels[tura.status]}</span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {tura.ponudjena_cena} €
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">Polazak</p>
                    <p className="text-gray-600">{tura.polazak}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">Destinacija</p>
                    <p className="text-gray-600">{tura.destinacija}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">Datum</p>
                    <p className="text-gray-600">
                      {new Date(tura.datum).toLocaleDateString('sr-RS', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Package className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">Vrsta robe</p>
                    <p className="text-gray-600">{tura.opis_robe}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {tura.vozac && (
            <Card className="border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Dodeljeni vozač</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Ime:</strong> {tura.vozac.puno_ime}</p>
                <p><strong>Telefon:</strong> {tura.vozac.telefon}</p>
                <p><strong>Email:</strong> {tura.vozac.email}</p>
                <p><strong>Tablice:</strong> {tura.vozac.registarske_tablice}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Prijave
                </span>
                <span className="text-sm font-normal text-gray-500">
                  {prijave?.length || 0} prijava
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/firma/ture/${tura.id}/prijave`}>
                  Pregledaj sve prijave
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

