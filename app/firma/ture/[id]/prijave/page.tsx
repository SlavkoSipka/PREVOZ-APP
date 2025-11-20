import { redirect, notFound } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Truck, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function FirmaPrijavePage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15)
  const { id } = await params
  
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  const { data: tura, error: turaError } = await supabase
    .from('ture')
    .select('*')
    .eq('id', id)
    .eq('firma_id', userData.user.id)
    .single()

  if (turaError || !tura) {
    notFound()
  }

  const { data: prijave } = await supabase
    .from('prijave')
    .select(`
      *,
      vozac:users!prijave_vozac_id_fkey(*)
    `)
    .eq('tura_id', id)
    .order('created_at', { ascending: false })

  const statusLabels: { [key: string]: string } = {
    ceka_admina: '⏳ Čeka odobrenje',
    odobreno: '✅ Odobreno',
    odbijeno: '❌ Odbijeno',
    zavrseno: '✅ Završeno',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData.profile} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/firma/ture/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad na turu
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Prijave za turu: {tura.polazak} → {tura.destinacija}
            </CardTitle>
            <CardDescription>
              Pregled svih vozača koji su se prijavili na ovu turu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!prijave || prijave.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nema prijava za ovu turu
              </div>
            ) : (
              <div className="space-y-4">
                {prijave.map((prijava: any) => (
                  <div
                    key={prijava.id}
                    className={`border rounded-lg p-4 ${
                      prijava.status === 'odobreno'
                        ? 'border-green-300 bg-green-50'
                        : prijava.status === 'zavrseno'
                        ? 'border-gray-300 bg-gray-50'
                        : prijava.status === 'odbijeno'
                        ? 'border-red-300 bg-red-50'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{prijava.vozac.puno_ime}</h3>
                      <span className={`text-sm font-medium ${
                        prijava.status === 'odobreno' 
                          ? 'text-green-600' 
                          : prijava.status === 'zavrseno'
                          ? 'text-gray-600'
                          : prijava.status === 'odbijeno'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {statusLabels[prijava.status]}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {prijava.vozac.telefon}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {prijava.vozac.email}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Prijavljen: {new Date(prijava.created_at).toLocaleString('sr-RS')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>Napomena:</strong> Admin će pregledati prijave i odobriti jednog vozača za vašu turu. 
              Kada vozač bude odobren, biće vam dostupni svi kontakt podaci.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

