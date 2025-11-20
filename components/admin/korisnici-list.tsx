'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Building2, Truck, Shield, CheckCircle, XCircle, Ban, Unlock, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Korisnik {
  id: string
  puno_ime: string
  email: string
  telefon: string
  uloga: string
  naziv_firme?: string
  verifikovan: boolean
  blokiran: boolean
  created_at: string
}

export function KorisniciList({ korisnici }: { korisnici: Korisnik[] }) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleBlokiraj = async (userId: string) => {
    setLoading(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ blokiran: true })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: 'Korisnik blokiran',
        description: 'Korisnik više ne može pristupiti platformi',
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDeblokiraj = async (userId: string) => {
    setLoading(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ blokiran: false })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: 'Korisnik deblokiran',
        description: 'Korisnik ponovo može pristupiti platformi',
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  if (!korisnici || korisnici.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nema registrovanih korisnika
      </div>
    )
  }

  const ulogaIcons = {
    vozac: <Truck className="h-4 w-4" />,
    poslodavac: <Building2 className="h-4 w-4" />,
    firma: <Building2 className="h-4 w-4" />,
    admin: <Shield className="h-4 w-4" />,
  }

  const ulogaLabels = {
    vozac: 'Vozač',
    poslodavac: 'Poslodavac',
    firma: 'Firma',
    admin: 'Admin',
  }

  const ulogaColors = {
    vozac: 'bg-blue-100 text-blue-800',
    poslodavac: 'bg-green-100 text-green-800',
    firma: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800',
  }

  const vozaci = korisnici.filter(k => k.uloga === 'vozac')
  const poslodavci = korisnici.filter(k => k.uloga === 'poslodavac' || k.uloga === 'firma')
  const admini = korisnici.filter(k => k.uloga === 'admin')

  const renderKorisnik = (korisnik: Korisnik) => (
        <div 
          key={korisnik.id} 
          className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{korisnik.puno_ime}</h3>
                <Badge className={ulogaColors[korisnik.uloga as keyof typeof ulogaColors]}>
                  <span className="flex items-center gap-1">
                    {ulogaIcons[korisnik.uloga as keyof typeof ulogaIcons]}
                    {ulogaLabels[korisnik.uloga as keyof typeof ulogaLabels]}
                  </span>
                </Badge>
              </div>
              
              {korisnik.naziv_firme && (
                <p className="text-sm text-gray-600">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  {korisnik.naziv_firme}
                </p>
              )}
              

              <div className="flex gap-4 text-sm text-gray-600">
                <span>📧 {korisnik.email}</span>
                <span>📞 {korisnik.telefon}</span>
              </div>

              <div className="flex gap-2">
                {korisnik.verifikovan ? (
                  <span className="flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verifikovan
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-gray-500">
                    <XCircle className="h-3 w-3 mr-1" />
                    Nije verifikovan
                  </span>
                )}
                
                {korisnik.blokiran && (
                  <span className="flex items-center text-xs text-red-600 font-semibold">
                    <XCircle className="h-3 w-3 mr-1" />
                    Blokiran
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Registrovan: {new Date(korisnik.created_at).toLocaleDateString('sr-RS')}
              </p>
            </div>

            {korisnik.uloga !== 'admin' && (
              <div className="flex flex-col gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/korisnici/${korisnik.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Pogledaj profil
                  </Link>
                </Button>
                {korisnik.uloga === 'vozac' && (
                  korisnik.blokiran ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeblokiraj(korisnik.id)}
                      disabled={loading === korisnik.id}
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Deblokiraj
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBlokiraj(korisnik.id)}
                      disabled={loading === korisnik.id}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Blokiraj
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
  )

  return (
    <Tabs defaultValue="svi" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="svi">
          Svi ({korisnici.length})
        </TabsTrigger>
        <TabsTrigger value="vozaci">
          <Truck className="mr-2 h-4 w-4" />
          Vozači ({vozaci.length})
        </TabsTrigger>
        <TabsTrigger value="poslodavci">
          <Building2 className="mr-2 h-4 w-4" />
          Poslodavci ({poslodavci.length})
        </TabsTrigger>
        <TabsTrigger value="admini">
          <Shield className="mr-2 h-4 w-4" />
          Admini ({admini.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="svi" className="space-y-3 mt-4">
        {korisnici.map(renderKorisnik)}
      </TabsContent>

      <TabsContent value="vozaci" className="space-y-3 mt-4">
        {vozaci.length > 0 ? (
          vozaci.map(renderKorisnik)
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nema registrovanih vozača
          </div>
        )}
      </TabsContent>

      <TabsContent value="poslodavci" className="space-y-3 mt-4">
        {poslodavci.length > 0 ? (
          poslodavci.map(renderKorisnik)
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nema registrovanih poslodavaca
          </div>
        )}
      </TabsContent>

      <TabsContent value="admini" className="space-y-3 mt-4">
        {admini.length > 0 ? (
          admini.map(renderKorisnik)
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nema admin korisnika
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

