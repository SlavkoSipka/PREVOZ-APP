'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Package, CheckCircle, XCircle, Clock, TruckIcon } from 'lucide-react'
import Link from 'next/link'
import { formatVreme } from '@/lib/utils'

interface Prijava {
  id: string
  status: string
  created_at: string
  razlog_odbijanja?: string
  tura: {
    id: string
    polazak: string
    destinacija: string
    datum: string
    ponudjena_cena: number
    opis_robe: string
    status: string
    vreme_polaska?: string
    firma?: {
      puno_ime: string
      naziv_firme?: string
    }
  } | null
}

interface MojePrijaveContentProps {
  initialPrijave: Prijava[]
  userId: string
}

export function MojePrijaveContent({ initialPrijave, userId }: MojePrijaveContentProps) {
  const [prijave, setPrijave] = useState<Prijava[]>(initialPrijave)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Real-time subscription
  useEffect(() => {
    const loadPrijave = async () => {
      setIsLoading(true)
      const { data } = await supabase
        .from('prijave')
        .select(`
          id, status, created_at, razlog_odbijanja,
          tura:ture(
            id, polazak, destinacija, datum, ponudjena_cena, opis_robe, status, vreme_polaska,
            firma:users!ture_firma_id_fkey(puno_ime, naziv_firme)
          )
        `)
        .eq('vozac_id', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setPrijave(data as any)
      }
      setIsLoading(false)
    }

    const channel = supabase
      .channel('moje-prijave-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prijave',
          filter: `vozac_id=eq.${userId}`
        },
        () => {
          loadPrijave()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Filtriraj prijave po statusu i statusu ture
  const naCekanju = prijave.filter((p: Prijava) => p.tura && p.status === 'ceka_admina')
  const odobrene = prijave.filter((p: Prijava) => p.tura && p.status === 'odobreno' && p.tura.status === 'dodeljena')
  const odbijene = prijave.filter((p: Prijava) => p.status === 'odbijeno')
  const zavrsene = prijave.filter((p: Prijava) => p.tura && (p.status === 'zavrseno' || (p.status === 'odobreno' && p.tura.status === 'zavrsena')))

  const renderPrijava = (prijava: Prijava, variant: 'cekanje' | 'odobreno' | 'odbijeno' | 'zavrseno') => {
    if (!prijava.tura) return null

    const getBorderClass = () => {
      if (variant === 'cekanje') return 'border-yellow-300 bg-yellow-50/30'
      if (variant === 'odobreno') return 'border-green-300 bg-green-50/30'
      if (variant === 'odbijeno') return 'border-l-4 border-l-orange-400 bg-orange-50/30'
      if (variant === 'zavrseno') return 'border-gray-300 bg-gray-50'
      return ''
    }

    const getStatusBadge = () => {
      if (variant === 'cekanje') {
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="h-4 w-4 mr-1" />
            Čeka odobrenje
          </div>
        )
      }
      if (variant === 'odobreno') {
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Odobreno
          </div>
        )
      }
      if (variant === 'odbijeno') {
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
            <XCircle className="h-4 w-4 mr-1" />
            Odbijeno
          </div>
        )
      }
      if (variant === 'zavrseno') {
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Završeno
          </div>
        )
      }
    }

    return (
      <Card key={prijava.id} className={getBorderClass()}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">
                {prijava.tura.polazak} → {prijava.tura.destinacija}
              </CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(prijava.tura.datum).toLocaleDateString('sr-RS')}
                    {prijava.tura.vreme_polaska && (
                      <span className="ml-2 font-semibold">({formatVreme(prijava.tura.vreme_polaska)})</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  <span>{prijava.tura.opis_robe}</span>
                </div>
                {prijava.tura.firma?.naziv_firme && (
                  <p className="text-xs text-gray-500 pt-1">
                    Firma: {prijava.tura.firma.naziv_firme}
                  </p>
                )}
                {prijava.razlog_odbijanja && variant === 'odbijeno' && (
                  <div className="bg-orange-100 border border-orange-300 rounded-md p-2 mt-2">
                    <p className="text-sm font-semibold text-orange-800 mb-1">Razlog odbijanja:</p>
                    <p className="text-sm text-orange-700">{prijava.razlog_odbijanja}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold mb-2 ${variant === 'odbijeno' ? 'text-gray-600' : 'text-primary'}`}>
                {prijava.tura.ponudjena_cena} €
              </div>
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild variant={variant === 'odbijeno' ? 'outline' : 'default'}>
            <Link href={`/vozac/ture/${prijava.tura.id}`}>
              Pogledaj detalje
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Live indicator */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Uživo
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="na_cekanju" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="na_cekanju">
            Na čekanju ({naCekanju.length})
          </TabsTrigger>
          <TabsTrigger value="odobrene">
            Odobrene ({odobrene.length})
          </TabsTrigger>
          <TabsTrigger value="odbijene">
            Odbijene ({odbijene.length})
          </TabsTrigger>
          <TabsTrigger value="zavrsene">
            Završene ({zavrsene.length})
          </TabsTrigger>
        </TabsList>

        {/* Na čekanju */}
        <TabsContent value="na_cekanju" className="mt-6">
          {naCekanju.length > 0 ? (
            <div className="grid gap-4">
              {naCekanju.map((prijava) => renderPrijava(prijava, 'cekanje'))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nemate prijava koje čekaju odobrenje</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Odobrene */}
        <TabsContent value="odobrene" className="mt-6">
          {odobrene.length > 0 ? (
            <div className="grid gap-4">
              {odobrene.map((prijava) => renderPrijava(prijava, 'odobreno'))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nemate odobrenih prijava</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Odbijene */}
        <TabsContent value="odbijene" className="mt-6">
          {odbijene.length > 0 ? (
            <div className="grid gap-4">
              {odbijene.map((prijava) => renderPrijava(prijava, 'odbijeno'))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nemate odbijenih prijava</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Završene */}
        <TabsContent value="zavrsene" className="mt-6">
          {zavrsene.length > 0 ? (
            <div className="grid gap-4">
              {zavrsene.map((prijava) => renderPrijava(prijava, 'zavrseno'))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nemate završenih tura</p>
                <Button asChild className="mt-4">
                  <Link href="/vozac">
                    Pregledaj dostupne ture
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}

