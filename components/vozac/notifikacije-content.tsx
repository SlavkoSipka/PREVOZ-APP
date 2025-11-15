'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, XCircle, Trash2, CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { formatVreme } from '@/lib/utils'

interface Notifikacija {
  id: string
  tip: 'odobreno' | 'odbijeno'
  poruka: string
  procitano: boolean
  created_at: string
  prijava: {
    id: string
    tura: {
      id: string
      polazak: string
      destinacija: string
      datum: string
      ponudjena_cena: number
    }
  } | null
}

interface NotifikacijeContentProps {
  initialNotifikacije: Notifikacija[]
  userId: string
}

export function NotifikacijeContent({ initialNotifikacije, userId }: NotifikacijeContentProps) {
  const [notifikacije, setNotifikacije] = useState<Notifikacija[]>(initialNotifikacije)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Automatski označi sve notifikacije kao pročitane kada se stranica učita
  useEffect(() => {
    const oznaciSveKaoProcitanoAuto = async () => {
      // Prvo označi sve nepročitane kao pročitane
      const neprocitane = initialNotifikacije.filter(n => !n.procitano)
      if (neprocitane.length > 0) {
        await supabase
          .from('notifikacije')
          .update({ procitano: true })
          .eq('vozac_id', userId)
          .eq('procitano', false)
      }
    }

    oznaciSveKaoProcitanoAuto()
  }, []) // Pokreće se samo jednom kada se komponenta mountuje

  // Real-time subscription
  useEffect(() => {
    const loadNotifikacije = async () => {
      const { data } = await supabase
        .from('notifikacije')
        .select(`
          id, tip, poruka, procitano, created_at,
          prijava:prijave(
            id,
            tura:ture(id, polazak, destinacija, datum, ponudjena_cena)
          )
        `)
        .eq('vozac_id', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setNotifikacije(data as Notifikacija[])
      }
    }

    const channel = supabase
      .channel('notifikacije-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifikacije',
          filter: `vozac_id=eq.${userId}`
        },
        () => {
          loadNotifikacije()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const obrisiNotifikaciju = async (notifikacijaId: string) => {
    setIsLoading(true)
    try {
      await supabase
        .from('notifikacije')
        .delete()
        .eq('id', notifikacijaId)

      setNotifikacije(prev => prev.filter(n => n.id !== notifikacijaId))
    } catch (error) {
      console.error('Greška pri brisanju:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Obaveštenja</h1>
        <p className="text-gray-600">
          {notifikacije.length > 0 
            ? `${notifikacije.length} ${notifikacije.length === 1 ? 'obaveštenje' : notifikacije.length < 5 ? 'obaveštenja' : 'obaveštenja'}` 
            : 'Nema obaveštenja'}
        </p>
      </div>

      {/* Live indicator */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Uživo
        </span>
      </div>

      {/* Notifikacije */}
      {notifikacije.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nemate nijednu notifikaciju</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifikacije.map((notifikacija) => (
            <Card 
              key={notifikacija.id} 
              className={`${!notifikacija.procitano ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      notifikacija.tip === 'odobreno' 
                        ? 'bg-green-100 text-green-600' 
                        : notifikacija.tip === 'odbijeno'
                        ? 'bg-orange-100 text-orange-600'
                        : notifikacija.tip === 'nova_ocena'
                        ? 'bg-yellow-100 text-yellow-600'
                        : notifikacija.tip === 'uplata_potrebna'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {notifikacija.tip === 'odobreno' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : notifikacija.tip === 'odbijeno' ? (
                        <XCircle className="h-5 w-5" />
                      ) : notifikacija.tip === 'nova_ocena' ? (
                        <Bell className="h-5 w-5" />
                      ) : notifikacija.tip === 'uplata_potrebna' ? (
                        <Bell className="h-5 w-5" />
                      ) : notifikacija.tip === 'admin_poruka' ? (
                        <Mail className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {notifikacija.tip === 'odobreno' 
                          ? 'Prijava odobrena' 
                          : notifikacija.tip === 'odbijeno'
                          ? 'Prijava odbijena'
                          : notifikacija.tip === 'nova_ocena'
                          ? 'Nova ocena'
                          : notifikacija.tip === 'uplata_potrebna'
                          ? 'Uplata provizije'
                          : notifikacija.tip === 'admin_poruka'
                          ? '📬 Poruka od administratora'
                          : 'Notifikacija'
                        }
                      </CardTitle>
                      <CardDescription className="text-base">
                        {notifikacija.poruka}
                      </CardDescription>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notifikacija.created_at).toLocaleString('sr-RS')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => obrisiNotifikaciju(notifikacija.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {notifikacija.prijava?.tura && (
                <CardContent>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/vozac/ture/${notifikacija.prijava.tura.id}`}>
                      Pogledaj detalje ture
                    </Link>
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

