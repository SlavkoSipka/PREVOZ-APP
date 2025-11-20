'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, MapPin, Calendar, Package, Euro, Users, CheckCircle, Clock, TruckIcon, Star } from 'lucide-react'
import Link from 'next/link'
import { OceniVozacaDialog } from '@/components/poslodavac/oceni-vozaca-dialog'

interface DashboardContentProps {
  initialData: {
    aktivneTure: number
    završeneTure: number
    ture: any[]
  }
  userId: string
}

export function DashboardContent({ initialData, userId }: DashboardContentProps) {
  const [aktivneTure, setAktivenTure] = useState(initialData.aktivneTure)
  const [završeneTure, setZavršeneTure] = useState(initialData.završeneTure)
  const [ture, setTure] = useState(initialData.ture)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const statusLabels: { [key: string]: string } = {
    aktivna: '🟢 Aktivna',
    na_cekanju: '🟡 Na čekanju',
    dodeljena: '🔵 Dodeljena',
    zavrsena: '✅ Završena',
    odbijena: '❌ Odbijena',
  }

  // Filtriraj ture po statusu
  const aktivneTureLista = ture.filter((t: any) => t.status === 'aktivna')
  const naCekanjuTure = ture.filter((t: any) => t.status === 'na_cekanju')
  const dodeljena = ture.filter((t: any) => t.status === 'dodeljena')
  const zavrsene = ture.filter((t: any) => t.status === 'zavrsena')
  const odbijene = ture.filter((t: any) => t.status === 'odbijena')

  // Funkcija za učitavanje svih podataka
  const loadData = async () => {
    setIsLoading(true)

    const [
      { count: aktivne },
      { count: zavrsene },
      { data: tureLista }
    ] = await Promise.all([
      // COUNT aktivnih tura
      supabase
        .from('ture')
        .select('*', { count: 'exact', head: true })
        .eq('firma_id', userId)
        .eq('status', 'aktivna'),

      // COUNT završenih tura
      supabase
        .from('ture')
        .select('*', { count: 'exact', head: true })
        .eq('firma_id', userId)
        .eq('status', 'zavrsena'),

      // Ture poslodavca
      supabase
        .from('ture')
        .select(`
          id, polazak, destinacija, datum, opis_robe, ponudjena_cena, status, created_at, dodeljeni_vozac_id,
          vozac:users!ture_dodeljeni_vozac_id_fkey(id, puno_ime),
          ocene(id, ocena, komentar)
        `)
        .eq('firma_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
    ])

    setAktivenTure(aktivne || 0)
    setZavršeneTure(zavrsene || 0)
    setTure(tureLista || [])
    setIsLoading(false)
  }

  useEffect(() => {
    // Real-time subscription za ture
    const tureChannel = supabase
      .channel('poslodavac-ture-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ture',
          filter: `firma_id=eq.${userId}`
        },
        (payload) => {
          console.log('Ture change detected:', payload)
          loadData()
        }
      )
      .subscribe()

    // Real-time subscription za prijave
    const prijaveChannel = supabase
      .channel('poslodavac-prijave-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prijave'
        },
        (payload) => {
          console.log('Prijave change detected:', payload)
          loadData()
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(tureChannel)
      supabase.removeChannel(prijaveChannel)
    }
  }, [userId])

  // Funkcija za renderovanje tura
  const renderTura = (tura: any) => (
    <Card key={tura.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              {tura.polazak} → {tura.destinacija}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(tura.datum).toLocaleDateString('sr-RS')}
              </span>
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                {tura.opis_robe}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-1">
              {tura.ponudjena_cena} €
            </div>
            <span className="text-sm font-medium">
              {statusLabels[tura.status]}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap items-center">
          <Button asChild variant="outline" size="sm">
            <Link href={`/poslodavac/ture/${tura.id}`} prefetch={true}>
              Pogledaj detalje
            </Link>
          </Button>
          {tura.status === 'zavrsena' && tura.vozac && tura.dodeljeni_vozac_id && (
            <>
              {tura.ocene && tura.ocene.length > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-green-700">Ocenjeno ({tura.ocene[0].ocena}/5)</span>
                </div>
              ) : (
                <OceniVozacaDialog
                  turaId={tura.id}
                  vozacId={tura.dodeljeni_vozac_id}
                  vozacIme={tura.vozac.puno_ime}
                  postojecaOcena={null}
                  buttonVariant="default"
                />
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      {/* Header sa live indicator */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">
                Upravljajte vašim turama
              </h1>
              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Uživo
              </span>
            </div>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/poslodavac/objavi-turu" prefetch={true}>
              <Plus className="mr-2 h-5 w-5" />
              Objavi novu turu
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistike */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivne ture</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aktivneTure}</div>
            <p className="text-xs text-muted-foreground">
              Trenutno aktivnih tura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Završene ture</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{završeneTure}</div>
            <p className="text-xs text-muted-foreground">
              Ukupno realizovano
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ture sa tabovima */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4">Vaše ture</h2>
        
        {!ture || ture.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Još niste objavili nijednu turu</p>
              <Button asChild>
                <Link href="/poslodavac/objavi-turu">
                  <Plus className="mr-2 h-4 w-4" />
                  Objavi prvu turu
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="aktivne" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
              <TabsTrigger value="aktivne" className="text-xs md:text-sm">
                <span className="hidden sm:inline">Aktivne</span>
                <span className="sm:hidden">Aktiv.</span>
                <span className="ml-1">({aktivneTureLista.length})</span>
              </TabsTrigger>
              <TabsTrigger value="na_cekanju" className="text-xs md:text-sm">
                <span className="hidden sm:inline">Na čekanju</span>
                <span className="sm:hidden">Čeka</span>
                <span className="ml-1">({naCekanjuTure.length})</span>
              </TabsTrigger>
              <TabsTrigger value="dodeljene" className="text-xs md:text-sm">
                <span className="hidden sm:inline">Dodeljene</span>
                <span className="sm:hidden">Dodel.</span>
                <span className="ml-1">({dodeljena.length})</span>
              </TabsTrigger>
              <TabsTrigger value="zavrsene" className="text-xs md:text-sm">
                <span className="hidden sm:inline">Završene</span>
                <span className="sm:hidden">Završ.</span>
                <span className="ml-1">({zavrsene.length})</span>
              </TabsTrigger>
              <TabsTrigger value="odbijene" className="text-xs md:text-sm">
                <span className="hidden sm:inline">Odbijene</span>
                <span className="sm:hidden">Odbij.</span>
                <span className="ml-1">({odbijene.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Aktivne ture */}
            <TabsContent value="aktivne" className="mt-6">
              {aktivneTureLista.length > 0 ? (
                <div className="space-y-4">
                  {aktivneTureLista.map(renderTura)}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nemate aktivnih tura</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Na čekanju */}
            <TabsContent value="na_cekanju" className="mt-6">
              {naCekanjuTure.length > 0 ? (
                <div className="space-y-4">
                  {naCekanjuTure.map(renderTura)}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nemate tura na čekanju</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Dodeljene ture */}
            <TabsContent value="dodeljene" className="mt-6">
              {dodeljena.length > 0 ? (
                <div className="space-y-4">
                  {dodeljena.map(renderTura)}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nemate dodeljenih tura</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Završene ture */}
            <TabsContent value="zavrsene" className="mt-6">
              {zavrsene.length > 0 ? (
                <div className="space-y-4">
                  {zavrsene.map(renderTura)}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nemate završenih tura</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Odbijene ture */}
            <TabsContent value="odbijene" className="mt-6">
              {odbijene.length > 0 ? (
                <div className="space-y-4">
                  {odbijene.map(renderTura)}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nemate odbijenih tura</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  )
}

