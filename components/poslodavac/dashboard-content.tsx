'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, MapPin, Calendar, Package, Euro, Users, CheckCircle, Clock, TruckIcon } from 'lucide-react'
import Link from 'next/link'
import { OceniVozacaDialog } from '@/components/poslodavac/oceni-vozaca-dialog'

interface DashboardContentProps {
  initialData: {
    aktivneTure: number
    završeneTure: number
    ukupnoPrijava: number
    ture: any[]
  }
  userId: string
}

export function DashboardContent({ initialData, userId }: DashboardContentProps) {
  const [aktivneTure, setAktivenTure] = useState(initialData.aktivneTure)
  const [završeneTure, setZavršeneTure] = useState(initialData.završeneTure)
  const [ukupnoPrijava, setUkupnoPrijava] = useState(initialData.ukupnoPrijava)
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
      { data: turaIds },
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

      // IDs svih tura
      supabase
        .from('ture')
        .select('id')
        .eq('firma_id', userId),

      // Ture poslodavca
      supabase
        .from('ture')
        .select(`
          id, polazak, destinacija, datum, opis_robe, ponudjena_cena, status, created_at, dodeljeni_vozac_id,
          prijave:prijave(count),
          vozac:users!ture_dodeljeni_vozac_id_fkey(id, puno_ime),
          ocene(id, ocena, komentar)
        `)
        .eq('firma_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
    ])

    // Broj prijava
    let prijave = 0
    if (turaIds && turaIds.length > 0) {
      const { count } = await supabase
        .from('prijave')
        .select('id', { count: 'exact', head: true })
        .in('tura_id', turaIds.map((t: any) => t.id))
      
      prijave = count || 0
    }

    setAktivenTure(aktivne || 0)
    setZavršeneTure(zavrsene || 0)
    setUkupnoPrijava(prijave)
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
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {tura.prijave?.[0]?.count || 0} prijava
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
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/poslodavac/ture/${tura.id}`}>
              Pogledaj detalje
            </Link>
          </Button>
          {tura.status === 'zavrsena' && tura.vozac && tura.dodeljeni_vozac_id && (
            <OceniVozacaDialog
              turaId={tura.id}
              vozacId={tura.dodeljeni_vozac_id}
              vozacIme={tura.vozac.puno_ime}
              postojecaOcena={tura.ocene && tura.ocene.length > 0 ? tura.ocene[0] : null}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      {/* Header sa live indicator */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              Upravljajte vašim turama
            </h1>
            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Uživo
            </span>
          </div>
        </div>
        <Button asChild size="lg">
          <Link href="/poslodavac/objavi-turu">
            <Plus className="mr-2 h-5 w-5" />
            Objavi novu turu
          </Link>
        </Button>
      </div>

      {/* Statistike */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prijave vozača</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ukupnoPrijava}</div>
            <p className="text-xs text-muted-foreground">
              Ukupno prijavljenih vozača
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ture sa tabovima */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Vaše ture</h2>
        
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
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="aktivne">
                Aktivne ({aktivneTureLista.length})
              </TabsTrigger>
              <TabsTrigger value="na_cekanju">
                Na čekanju ({naCekanjuTure.length})
              </TabsTrigger>
              <TabsTrigger value="dodeljene">
                Dodeljene ({dodeljena.length})
              </TabsTrigger>
              <TabsTrigger value="zavrsene">
                Završene ({zavrsene.length})
              </TabsTrigger>
              <TabsTrigger value="odbijene">
                Odbijene ({odbijene.length})
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

