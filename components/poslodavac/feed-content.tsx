'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Package, Euro, ArrowRight, Building2, FileText, Search } from 'lucide-react'
import Link from 'next/link'
import { formatVreme } from '@/lib/utils'

interface FeedContentProps {
  initialTure: any[]
  userId: string
}

export function FeedContent({ initialTure, userId }: FeedContentProps) {
  const [ture, setTure] = useState(initialTure)
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState('najnovije')
  const [polazakFilter, setPolazakFilter] = useState('')
  const [destinacijaFilter, setDestinacijaFilter] = useState('')
  const supabase = createClient()

  const statusLabels: { [key: string]: string } = {
    aktivna: '🟢 Aktivna',
    dodeljena: '🔵 Dodeljena',
  }

  // Funkcija za učitavanje tura
  const loadTure = async () => {
    setIsLoading(true)
    
    let query = supabase
      .from('ture')
      .select(`
        id, polazak, destinacija, datum, opis_robe, ponudjena_cena, vreme_polaska, status, created_at, firma_id, faktura,
        firma:users!ture_firma_id_fkey(puno_ime, naziv_firme),
        prijave:prijave(count)
      `)
      .in('status', ['aktivna', 'dodeljena'])

    // Primeni filtere za polazak i destinaciju
    if (polazakFilter.trim()) {
      query = query.ilike('polazak', `%${polazakFilter.trim()}%`)
    }
    if (destinacijaFilter.trim()) {
      query = query.ilike('destinacija', `%${destinacijaFilter.trim()}%`)
    }

    // Primeni sortiranje
    if (sortBy === 'cena_rastuce') {
      query = query.order('ponudjena_cena', { ascending: true })
    } else if (sortBy === 'cena_opadajuce') {
      query = query.order('ponudjena_cena', { ascending: false })
    } else if (sortBy === 'datum_starije') {
      query = query.order('datum', { ascending: true })
    } else if (sortBy === 'datum_novije') {
      query = query.order('datum', { ascending: false })
    } else {
      // Default: najnovije prvo (po created_at)
      query = query.order('created_at', { ascending: false })
    }

    query = query.limit(50)

    const { data } = await query

    if (data) {
      setTure(data)
    }
    setIsLoading(false)
  }

  // Učitaj ture kad se promene filteri ili sortiranje
  useEffect(() => {
    loadTure()
  }, [sortBy, polazakFilter, destinacijaFilter])

  useEffect(() => {
    // Real-time subscription za ture
    const tureChannel = supabase
      .channel('ture-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ture'
        },
        (payload) => {
          console.log('Ture change detected:', payload)
          loadTure()
        }
      )
      .subscribe()

    // Real-time subscription za prijave (kad se promeni broj prijava)
    const prijaveChannel = supabase
      .channel('prijave-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prijave'
        },
        (payload) => {
          console.log('Prijave change detected:', payload)
          loadTure()
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(tureChannel)
      supabase.removeChannel(prijaveChannel)
    }
  }, [])

  return (
    <div>
      {/* Header sa live indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">Sve objavljene ture</h2>
          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Uživo
          </span>
        </div>

        {/* Filteri i sortiranje */}
        <div className="grid md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
          <div className="md:col-span-1">
            <Label htmlFor="polazak-filter" className="text-sm mb-1 block">
              Od
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="polazak-filter"
                placeholder="Beograd..."
                value={polazakFilter}
                onChange={(e) => setPolazakFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="destinacija-filter" className="text-sm mb-1 block">
              Do
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="destinacija-filter"
                placeholder="Zagreb..."
                value={destinacijaFilter}
                onChange={(e) => setDestinacijaFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="sort" className="text-sm mb-1 block">
              Sortiranje
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort">
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

        <p className="text-sm text-gray-600 mt-2">
          {ture.length} {ture.length === 1 ? 'tura' : ture.length < 5 ? 'ture' : 'tura'}
        </p>
      </div>

      {!ture || ture.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Trenutno nema objavljenih tura</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ture.map((tura: any) => {
            const jeMojaTura = tura.firma_id === userId
            return (
              <Card 
                key={tura.id} 
                className={`hover:shadow-lg transition-shadow ${jeMojaTura ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100">
                      {statusLabels[tura.status]}
                    </span>
                    {jeMojaTura && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary">
                        Vaša tura
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="truncate">{tura.polazak}</span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{tura.destinacija}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {new Date(tura.datum).toLocaleDateString('sr-RS')}
                      {tura.vreme_polaska && <span className="ml-2 font-semibold">({formatVreme(tura.vreme_polaska)})</span>}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{tura.opis_robe}</span>
                  </div>
                  {tura.firma?.naziv_firme && !jeMojaTura && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{tura.firma.naziv_firme}</span>
                    </div>
                  )}
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
                        {tura.faktura === 'ne' && 'Bez fakture'}
                        {tura.faktura === 'nije_obavezna' && 'Faktura po dogovoru'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center text-primary font-bold text-xl">
                      <Euro className="h-5 w-5 mr-1" />
                      {tura.ponudjena_cena}
                    </div>
                    <Button 
                      asChild 
                      size="sm"
                      variant={jeMojaTura ? "default" : "outline"}
                    >
                      <Link href={`/poslodavac/ture/${tura.id}?from=objave`}>
                        Pogledaj
                      </Link>
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 pt-1">
                    {tura.prijave?.[0]?.count || 0} prijava vozača
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

