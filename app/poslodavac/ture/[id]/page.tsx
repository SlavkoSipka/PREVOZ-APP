import { redirect, notFound } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Package, Euro, ArrowLeft, Users, FileText, Star } from 'lucide-react'
import Link from 'next/link'
import { OceniVozacaDialog } from '@/components/poslodavac/oceni-vozaca-dialog'

export default async function PoslodavacTuraDetaljiPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  // Await params i searchParams (Next.js 15)
  const { id } = await params
  const { from } = await searchParams
  
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Učitaj turu sa firmom koja ju je objavila
  const { data: tura, error } = await supabase
    .from('ture')
    .select(`
      *,
      firma:users!ture_firma_id_fkey(puno_ime, naziv_firme),
      vozac:users!ture_dodeljeni_vozac_id_fkey(puno_ime, telefon, email)
    `)
    .eq('id', id)
    .single()

  if (error || !tura) {
    notFound()
  }

  // Proveri da li je ovo poslodavčeva tura
  const jeMojaTura = tura.firma_id === userData.user.id

  // Učitaj prijave samo ako je to poslodavčeva tura
  const { data: prijave } = jeMojaTura ? await supabase
    .from('prijave')
    .select('*')
    .eq('tura_id', id) : { data: [] }

  // Učitaj ocenu ako je tura završena i ima dodeljenog vozača
  const { data: postojecaOcena } = (jeMojaTura && tura.status === 'zavrsena' && tura.dodeljeni_vozac_id) 
    ? await supabase
        .from('ocene')
        .select('id, ocena, komentar')
        .eq('tura_id', id)
        .eq('vozac_id', tura.dodeljeni_vozac_id)
        .eq('poslodavac_id', userData.user.id)
        .maybeSingle() // Koristi maybeSingle() umesto single() da ne dobijemo error ako ne postoji
    : { data: null }

  const statusLabels: { [key: string]: string } = {
    aktivna: '🟢 Aktivna',
    na_cekanju: '🟡 Na čekanju',
    dodeljena: '🔵 Dodeljena',
    zavrsena: '✅ Završena',
  }

  // Odredi gde da vrati korisnika
  const backUrl = from === 'objave' ? '/poslodavac/feed' : '/poslodavac'
  const backText = from === 'objave' ? 'Nazad' : 'Nazad'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...userData.profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={backUrl}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backText}
          </Link>
        </Button>

        <div className="grid gap-6">
          {!jeMojaTura && (
            <Card className="border-blue-300 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800">
                  <strong>Napomena:</strong> Ovo je tura koju je objavio/la {tura.firma?.naziv_firme || tura.firma?.puno_ime}
                </p>
              </CardContent>
            </Card>
          )}

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

              {/* Informacija o fakturi */}
              {tura.faktura && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <p className="font-semibold mb-1">Faktura</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        tura.faktura === 'da' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : tura.faktura === 'ne'
                          ? 'bg-gray-100 text-gray-800 border border-gray-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {tura.faktura === 'da' && '✅ Obavezna - Potrebna faktura'}
                        {tura.faktura === 'ne' && '❌ Nije potrebna'}
                        {tura.faktura === 'nije_obavezna' && 'ℹ️ Nije obavezna - Po dogovoru'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {tura.vozac && jeMojaTura && (
            <Card className="border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center justify-between">
                  <span>Dodeljeni vozač</span>
                  {tura.status === 'zavrsena' && (
                    <>
                      {postojecaOcena ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-300 rounded-md">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-green-800">Ocenjeno ({postojecaOcena.ocena}/5)</span>
                        </div>
                      ) : (
                        <OceniVozacaDialog 
                          turaId={tura.id}
                          vozacId={tura.dodeljeni_vozac_id!}
                          vozacIme={tura.vozac.puno_ime}
                          postojecaOcena={null}
                        />
                      )}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Ime:</strong> {tura.vozac.puno_ime}</p>
                <p><strong>Telefon:</strong> {tura.vozac.telefon}</p>
                <p><strong>Email:</strong> {tura.vozac.email}</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}

