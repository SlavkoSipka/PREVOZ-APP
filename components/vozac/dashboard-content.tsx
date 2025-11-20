'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Package, Euro, ArrowRight, CheckCircle, Star, XCircle, FileText, Search } from 'lucide-react'
import Link from 'next/link'
import { formatVreme } from '@/lib/utils'

interface DashboardContentProps {
  initialData: {
    ture: any[]
    prijave: any[]
    odbijenePrijave: any[]
    brojZavrsenihTura: number
    zavrseneTure: any[]
    userProfile: any
  }
  userId: string
}

export function DashboardContent({ initialData, userId }: DashboardContentProps) {
  const [ture, setTure] = useState(initialData.ture)
  const [prijave, setPrijave] = useState(initialData.prijave)
  const [odbijenePrijave, setOdbijenePrijave] = useState(initialData.odbijenePrijave)
  const [brojZavrsenihTura, setBrojZavrsenihTura] = useState(initialData.brojZavrsenihTura)
  const [zavrseneTure, setZavrseneTure] = useState(initialData.zavrseneTure)
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState('najnovije')
  const [polazakFilter, setPolazakFilter] = useState('')
  const [destinacijaFilter, setDestinacijaFilter] = useState('')
  const supabase = createClient()

  // Funkcija za učitavanje svih podataka
  const loadData = async () => {
    setIsLoading(true)

    // Kreiraj query za aktivne ture sa filterima
    let tureQuery = supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, vreme_polaska, faktura, created_at,
        firma:users!ture_firma_id_fkey(puno_ime, naziv_firme)
      `)
      .eq('status', 'aktivna')

    // Primeni filtere
    if (polazakFilter.trim()) {
      tureQuery = tureQuery.ilike('polazak', `%${polazakFilter.trim()}%`)
    }
    if (destinacijaFilter.trim()) {
      tureQuery = tureQuery.ilike('destinacija', `%${destinacijaFilter.trim()}%`)
    }

    // Primeni sortiranje
    if (sortBy === 'cena_rastuce') {
      tureQuery = tureQuery.order('ponudjena_cena', { ascending: true })
    } else if (sortBy === 'cena_opadajuce') {
      tureQuery = tureQuery.order('ponudjena_cena', { ascending: false })
    } else if (sortBy === 'datum_starije') {
      tureQuery = tureQuery.order('datum', { ascending: true })
    } else if (sortBy === 'datum_novije') {
      tureQuery = tureQuery.order('datum', { ascending: false })
    } else {
      // Default: najnovije prvo (po created_at)
      tureQuery = tureQuery.order('created_at', { ascending: false })
    }

    tureQuery = tureQuery.limit(20)

    const [
      { data: tureData },
      { data: prijaveData },
      { data: odbijenePrijaveData },
      { count: brojZavrsenihCount },
      { data: zavrseneTureData }
    ] = await Promise.all([
      // Aktivne ture sa filterima i sortiranjem
      tureQuery,

      // Prijave vozača
      supabase
        .from('prijave')
        .select(`
          id, status, created_at,
          tura:ture(id, polazak, destinacija, datum, ponudjena_cena, opis_robe, status, vreme_polaska)
        `)
        .eq('vozac_id', userId)
        .in('status', ['ceka_admina', 'odobreno'])
        .limit(50),

      // Odbijene prijave
      supabase
        .from('prijave')
        .select(`
          id, status, created_at, razlog_odbijanja,
          tura:ture(id, polazak, destinacija, datum, ponudjena_cena, opis_robe, status, vreme_polaska)
        `)
        .eq('vozac_id', userId)
        .eq('status', 'odbijeno')
        .order('created_at', { ascending: false })
        .limit(10),

      // COUNT završenih tura
      supabase
        .from('ture')
        .select('*', { count: 'exact', head: true })
        .eq('dodeljeni_vozac_id', userId)
        .eq('status', 'zavrsena'),

      // Završene ture
      supabase
        .from('ture')
        .select(`
          id, polazak, destinacija, datum, ponudjena_cena, created_at,
          firma:users!ture_firma_id_fkey(puno_ime, naziv_firme),
          uplata:uplate(status),
          ocene(ocena, komentar)
        `)
        .eq('dodeljeni_vozac_id', userId)
        .eq('status', 'zavrsena')
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    setTure(tureData || [])
    setPrijave(prijaveData || [])
    setOdbijenePrijave(odbijenePrijaveData || [])
    setBrojZavrsenihTura(brojZavrsenihCount || 0)
    setZavrseneTure(zavrseneTureData || [])
    setIsLoading(false)
  }

  // Učitaj podatke kad se promene filteri ili sortiranje
  useEffect(() => {
    loadData()
  }, [sortBy, polazakFilter, destinacijaFilter])

  useEffect(() => {
    // Real-time subscription za ture
    const tureChannel = supabase
      .channel('vozac-ture-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ture'
        },
        (payload) => {
          console.log('Ture change detected:', payload)
          loadData()
        }
      )
      .subscribe()

    // Real-time subscription za prijave
    const prijaveChannel = supabase
      .channel('vozac-prijave-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prijave',
          filter: `vozac_id=eq.${userId}`
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

  // Kreiraj Set odbijenih tura za brzu proveru
  const odbijeneTureIds = new Set(odbijenePrijave?.map((p: any) => p.tura?.id).filter(Boolean) || [])

  // Filtriraj prijave - prikaži samo one gde prijava i tura NISU završene
  const aktivnePrijave = prijave?.filter((p: any) => 
    p.tura && 
    p.status !== 'zavrseno' && 
    p.tura.status !== 'zavrsena'
  ) || []

  // Statistike - prosečna ocena
  const prosecnaOcena = 0

  return (
    <>
      {/* Live indicator */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Uživo
        </span>
      </div>

      {/* Statistike */}
      {brojZavrsenihTura > 0 && (
        <div className="grid md:grid-cols-1 gap-6 mb-8 max-w-md">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Izvezene ture</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brojZavrsenihTura}</div>
              <p className="text-xs text-muted-foreground">
                Ukupno završenih tura
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ture - Tabovi */}
      <Tabs defaultValue="dostupne" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dostupne">Dostupne ture</TabsTrigger>
          <TabsTrigger value="izvezene">
            Izvezene ture ({brojZavrsenihTura})
          </TabsTrigger>
        </TabsList>

          {/* Dostupne ture */}
          <TabsContent value="dostupne" className="mt-6">
            {/* Filteri i sortiranje */}
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border mb-6">
              <div className="md:col-span-1">
                <Label htmlFor="polazak-filter-vozac" className="text-sm mb-1 block">
                  Od
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="polazak-filter-vozac"
                    placeholder="Beograd..."
                    value={polazakFilter}
                    onChange={(e) => setPolazakFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="destinacija-filter-vozac" className="text-sm mb-1 block">
                  Do
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="destinacija-filter-vozac"
                    placeholder="Zagreb..."
                    value={destinacijaFilter}
                    onChange={(e) => setDestinacijaFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <Label htmlFor="sort-vozac" className="text-sm mb-1 block">
                  Sortiranje
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-vozac">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="najnovije">Najnovije</SelectItem>
                    <SelectItem value="cena_rastuce">Cena: Rastuće</SelectItem>
                    <SelectItem value="cena_opadajuce">Cena: Opadajuće</SelectItem>
                    <SelectItem value="datum_novije">Datum: Novije</SelectItem>
                    <SelectItem value="datum_starije">Datum: Starije</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPolazakFilter('')
                    setDestinacijaFilter('')
                    setSortBy('najnovije')
                  }}
                  className="w-full"
                >
                  Resetuj filtere
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {ture.length} {ture.length === 1 ? 'tura' : ture.length < 5 ? 'ture' : 'tura'}
            </p>
          {!ture || ture.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Trenutno nema dostupnih tura. Proverite ponovo uskoro.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ture.map((tura: any) => {
                const jeOdbijena = odbijeneTureIds.has(tura.id)
                return (
                  <Card 
                    key={tura.id} 
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center justify-between">
                        <span className="truncate">{tura.polazak}</span>
                        <ArrowRight className="h-5 w-5 flex-shrink-0 mx-2" />
                        <span className="truncate">{tura.destinacija}</span>
                      </CardTitle>
                      {jeOdbijena && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium mt-2">
                          <XCircle className="h-3 w-3" />
                          Odbijeno
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          {new Date(tura.datum).toLocaleDateString('sr-RS')}
                          {tura.vreme_polaska && <span className="ml-2 font-semibold">({formatVreme(tura.vreme_polaska)})</span>}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{tura.opis_robe}</span>
                      </div>
                      {tura.faktura && (
                        <div className="flex items-center text-xs">
                          <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            tura.faktura === 'da' 
                              ? 'bg-green-100 text-green-700' 
                              : tura.faktura === 'ne'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {tura.faktura === 'da' && 'Faktura obavezna'}
                            {tura.faktura === 'ne' && 'Faktura nije potrebna'}
                            {tura.faktura === 'nije_obavezna' && 'Faktura po dogovoru'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-primary font-bold text-xl">
                          <Euro className="h-5 w-5 mr-1" />
                          {tura.ponudjena_cena}
                        </div>
                        <Button 
                          asChild 
                          size="sm"
                          variant={jeOdbijena ? "outline" : "default"}
                          disabled={initialData.userProfile.blokiran}
                        >
                          <Link href={`/vozac/ture/${tura.id}`}>
                            Pogledaj
                          </Link>
                        </Button>
                      </div>
                      {tura.firma?.naziv_firme && (
                        <p className="text-xs text-gray-500 pt-2 border-t">
                          Firma: {tura.firma.naziv_firme}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Izvezene ture */}
        <TabsContent value="izvezene" className="mt-6">
          {!zavrseneTure || zavrseneTure.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Još uvek niste izvezli nijednu turu.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {zavrseneTure.map((tura: any) => (
                <Card key={tura.id} className="border-green-200 bg-green-50/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          {tura.polazak} → {tura.destinacija}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(tura.datum).toLocaleDateString('sr-RS')}
                            </span>
                            {tura.firma?.naziv_firme && (
                              <span className="flex items-center">
                                Firma: {tura.firma.naziv_firme}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-primary">
                          {tura.ponudjena_cena} €
                        </div>
                        {tura.uplata?.[0]?.status === 'placeno' ? (
                          <div className="bg-green-100 border border-green-300 rounded-md px-2 py-1">
                            <span className="text-xs text-green-700 font-semibold">
                              ✅ Provizija plaćena
                            </span>
                          </div>
                        ) : tura.uplata?.[0]?.status === 'u_toku' ? (
                          <div className="bg-yellow-100 border border-yellow-300 rounded-md px-2 py-1">
                            <span className="text-xs text-yellow-700 font-semibold">
                              ⏳ Čeka plaćanje
                            </span>
                          </div>
                        ) : (
                          <div className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1">
                            <span className="text-xs text-gray-700 font-semibold">
                              ℹ️ Nema podataka
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tura.ocene && tura.ocene.length > 0 ? (
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Ocena:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= tura.ocene[0].ocena
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-lg">{tura.ocene[0].ocena}/5</span>
                        </div>
                        {tura.ocene[0].komentar && (
                          <p className="text-sm text-gray-700 italic border-l-2 border-yellow-400 pl-3">
                            "{tura.ocene[0].komentar}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 italic">
                        Još niste ocenjeni za ovu turu.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}

