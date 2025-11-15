'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

export default function PoslodavacOnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ime: '',
    prezime: '',
    telefon: '',
    grad: '',
    naziv_firme: '',
    opis: '',
  })
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      console.log('🔍 POSLODAVAC-ONBOARDING: Checking profile...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('❌ POSLODAVAC-ONBOARDING: No user, redirecting to /prijava')
        router.push('/prijava')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('profil_popunjen, uloga')
        .eq('id', user.id)
        .single()

      console.log('📋 POSLODAVAC-ONBOARDING: Profile data:', profile)

      // ✅ NE proveravaj uloga - može biti NULL! (postavlja se tek na submit)
      
      // Ako je već popunio profil, redirect na dashboard
      if (profile?.profil_popunjen && profile?.uloga === 'poslodavac') {
        console.log('✅ POSLODAVAC-ONBOARDING: Profile already complete, redirecting to /poslodavac')
        router.push('/poslodavac')
      }
    }
    checkProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: 'Greška',
          description: 'Niste prijavljeni.',
          variant: 'destructive',
        })
        return
      }

      // TEK SADA postavi uloga = 'poslodavac' + svi podaci
      const { error } = await supabase
        .from('users')
        .update({
          uloga: 'poslodavac',  // ✅ TEK SADA postavi uloga!
          ime: formData.ime,
          prezime: formData.prezime,
          puno_ime: `${formData.ime} ${formData.prezime}`,
          telefon: formData.telefon,
          grad: formData.grad,
          naziv_firme: formData.naziv_firme || null,
          opis: formData.opis,
          profil_popunjen: true,
        })
        .eq('id', user.id)

      if (error) throw error

      // Očisti sessionStorage
      sessionStorage.removeItem('selected_role')

      toast({
        title: 'Uspešno!',
        description: 'Profil je popunjen. Dobrodošli!',
      })

      router.push('/poslodavac')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/select-role')}
              type="button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nazad
            </Button>
          </div>
          <CardTitle className="text-3xl">Popunite vaš profil - Poslodavac</CardTitle>
          <CardDescription>
            Pre nego što nastavite, potrebno je da popunite osnovne informacije
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ime">Ime *</Label>
                <Input
                  id="ime"
                  placeholder="Marko"
                  value={formData.ime}
                  onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prezime">Prezime *</Label>
                <Input
                  id="prezime"
                  placeholder="Marković"
                  value={formData.prezime}
                  onChange={(e) => setFormData({ ...formData, prezime: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefon">Broj telefona *</Label>
                <Input
                  id="telefon"
                  type="tel"
                  placeholder="+381 60 123 4567"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grad">Grad *</Label>
                <Input
                  id="grad"
                  placeholder="Beograd"
                  value={formData.grad}
                  onChange={(e) => setFormData({ ...formData, grad: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="naziv_firme">Naziv firme (opciono)</Label>
              <Input
                id="naziv_firme"
                placeholder="Moja Firma d.o.o."
                value={formData.naziv_firme}
                onChange={(e) => setFormData({ ...formData, naziv_firme: e.target.value })}
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Naziv firme će biti vidljiv samo dodeljenom vozaču nakon prihvatanja ture
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opis">Kratak opis *</Label>
              <Textarea
                id="opis"
                placeholder="Opišite vašu delatnost, šta radite, kakve ste poslove obavljali..."
                value={formData.opis}
                onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                required
                disabled={loading}
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Čuvanje...' : 'Sačuvaj i nastavi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

