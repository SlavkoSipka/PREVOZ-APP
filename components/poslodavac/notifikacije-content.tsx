'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, XCircle, Trash2, CheckCircle, Mail, Truck, Star } from 'lucide-react'
import Link from 'next/link'
import { OceniVozacaDialog } from './oceni-vozaca-dialog'

interface Notifikacija {
  id: string
  tip: string
  poruka: string
  procitano: boolean
  created_at: string
  tura_id?: string
  tura?: {
    id: string
    polazak: string
    destinacija: string
    datum: string
    ponudjena_cena: number
    dodeljeni_vozac_id?: string
    dodeljeni_vozac?: {
      id: string
      puno_ime: string
    }
  } | null
  ocene?: Array<{
    id: string
    ocena: number
  }>
}

interface NotifikacijeContentProps {
  initialNotifikacije: Notifikacija[]
  userId: string
}

export function NotifikacijeContentPoslodavac({ initialNotifikacije, userId }: NotifikacijeContentProps) {
  const [notifikacije, setNotifikacije] = useState<Notifikacija[]>(initialNotifikacije)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Automatski označi sve notifikacije kao pročitane kada se stranica učita
  useEffect(() => {
    const oznaciSveKaoProcitanoAuto = async () => {
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
  }, [])

  // Real-time subscription
  useEffect(() => {
    const loadNotifikacije = async () => {
      const { data } = await supabase
        .from('notifikacije')
        .select(`
          id, tip, poruka, procitano, created_at, tura_id,
          tura:ture(
            id, polazak, destinacija, datum, ponudjena_cena, dodeljeni_vozac_id,
            dodeljeni_vozac:users!ture_dodeljeni_vozac_id_fkey(id, puno_ime)
          ),
          ocene(id, ocena)
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
      const { error } = await supabase
        .from('notifikacije')
        .delete()
        .eq('id', notifikacijaId)

      if (error) throw error

      setNotifikacije(notifikacije.filter(n => n.id !== notifikacijaId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTipNaslova = (tip: string) => {
    switch (tip) {
      case 'tura_odobrena':
        return 'Tura odobrena'
      case 'vozac_dodeljen':
        return 'Vozač dodeljen'
      case 'tura_zavrsena':
        return 'Tura završena'
      case 'admin_poruka':
        return '📬 Poruka od administratora'
      case 'nova_ocena':
        return 'Nova ocena'
      default:
        return 'Notifikacija'
    }
  }

  const getTipBoje = (tip: string) => {
    switch (tip) {
      case 'tura_odobrena':
        return 'bg-green-100 text-green-600'
      case 'vozac_dodeljen':
        return 'bg-blue-100 text-blue-600'
      case 'tura_zavrsena':
        return 'bg-purple-100 text-purple-600'
      case 'admin_poruka':
        return 'bg-blue-100 text-blue-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getTipIkonice = (tip: string) => {
    switch (tip) {
      case 'tura_odobrena':
        return <CheckCircle className="h-5 w-5" />
      case 'vozac_dodeljen':
        return <Truck className="h-5 w-5" />
      case 'tura_zavrsena':
        return <Star className="h-5 w-5" />
      case 'admin_poruka':
        return <Mail className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4">
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
          {notifikacije.map((notifikacija) => {
            const vecOcenjen = notifikacija.ocene && notifikacija.ocene.length > 0
            const mozeOceniti = notifikacija.tip === 'tura_zavrsena' && notifikacija.tura?.dodeljeni_vozac_id && !vecOcenjen

            return (
              <Card 
                key={notifikacija.id} 
                className={`${!notifikacija.procitano ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${getTipBoje(notifikacija.tip)}`}>
                        {getTipIkonice(notifikacija.tip)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {getTipNaslova(notifikacija.tip)}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {notifikacija.poruka}
                        </CardDescription>

                        {/* Detalji ture */}
                        {notifikacija.tura && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-1">
                            <p className="text-sm font-semibold">
                              {notifikacija.tura.polazak} → {notifikacija.tura.destinacija}
                            </p>
                            <p className="text-xs text-gray-600">
                              📅 {new Date(notifikacija.tura.datum).toLocaleDateString('sr-RS')} | 💰 {notifikacija.tura.ponudjena_cena}€
                            </p>
                            {notifikacija.tura.dodeljeni_vozac && (
                              <p className="text-xs text-blue-600 font-semibold">
                                🚚 Vozač: {notifikacija.tura.dodeljeni_vozac.puno_ime}
                              </p>
                            )}
                          </div>
                        )}

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
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Akcije */}
                <CardContent className="pt-0">
                  <div className="flex gap-2 flex-wrap">
                    {/* Link ka turi */}
                    {notifikacija.tura_id && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/poslodavac/ture/${notifikacija.tura_id}`}>
                          Pogledaj turu
                        </Link>
                      </Button>
                    )}

                    {/* Dugme za ocenjivanje vozača */}
                    {mozeOceniti && notifikacija.tura && (
                      <OceniVozacaDialog
                        turaId={notifikacija.tura.id}
                        vozacId={notifikacija.tura.dodeljeni_vozac_id!}
                        vozacIme={notifikacija.tura.dodeljeni_vozac?.puno_ime || 'Vozač'}
                        postojecaOcena={null}
                        trigger={
                          <Button variant="default" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Ocenite vozača
                          </Button>
                        }
                      />
                    )}

                    {/* Već ocenjen */}
                    {vecOcenjen && (
                      <Button variant="outline" size="sm" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Vozač ocenjen
                      </Button>
                    )}
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

