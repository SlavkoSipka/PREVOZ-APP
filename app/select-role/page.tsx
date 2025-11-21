'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Truck, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function SelectRolePage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 SELECT-ROLE: Checking auth...')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('❌ SELECT-ROLE: No user, redirecting to /prijava')
        router.push('/prijava')
        return
      }

      console.log('✅ SELECT-ROLE: User found:', user.id)

      // Proveri da li vec ima profil
      const { data: profile, error } = await supabase
        .from('users')
        .select('uloga, profil_popunjen')
        .eq('id', user.id)
        .single()

      console.log('📋 SELECT-ROLE: Profile data:', profile, 'Error:', error)

      if (profile?.uloga && profile.uloga !== null) {
        console.log('⚠️ SELECT-ROLE: User already has role:', profile.uloga)
        // Vec ima ulogu, redirect na onboarding ili dashboard
        if (!profile.profil_popunjen) {
          router.push(profile.uloga === 'vozac' ? '/vozac-onboarding' : '/poslodavac-onboarding')
        } else {
          router.push(profile.uloga === 'vozac' ? '/vozac' : '/poslodavac')
        }
        return
      }

      console.log('✅ SELECT-ROLE: No role yet, showing selection')
      setChecking(false)
    }

    checkAuth()
  }, [router, supabase])

  const handleSelectRole = async (role: 'vozac' | 'poslodavac') => {
    console.log('🎯 SELECT-ROLE: Button clicked, role:', role)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('❌ SELECT-ROLE: No user in handleSelectRole')
        toast({
          title: 'Greška',
          description: 'Niste prijavljeni.',
          variant: 'destructive',
        })
        router.push('/prijava')
        return
      }

      console.log('✅ SELECT-ROLE: User confirmed, saving to sessionStorage')
      // NE upisuj uloga još - čuvaj u sessionStorage privremeno
      sessionStorage.setItem('selected_role', role)

      console.log('➡️ SELECT-ROLE: Redirecting to onboarding:', role)
      // Redirect na onboarding (uloga će se upisati tek nakon "Sačuvaj")
      router.push(role === 'vozac' ? '/vozac-onboarding' : '/poslodavac-onboarding')
    } catch (error) {
      console.error('❌ SELECT-ROLE Error:', error)
      toast({
        title: 'Greška',
        description: 'Došlo je do neočekivane greške.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">Izaberite tip naloga</h1>
          <p className="text-base sm:text-lg text-gray-600 px-2">
            Kako planirate da koristite PreveziMe?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Vozač */}
          <Card className="border-2 hover:border-primary hover:shadow-xl transition-all">
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="mx-auto mb-3 sm:mb-4 bg-primary/10 p-4 sm:p-5 md:p-6 rounded-full">
                <Truck className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl mb-2">Vozač</CardTitle>
              <CardDescription className="text-sm sm:text-base px-2">
                Pronađite poslove i zaradite prihvatanjem tura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 text-base sm:text-lg">✓</span>
                  <span>Pristup aktivnim turama</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 text-base sm:text-lg">✓</span>
                  <span>Fleksibilan raspored</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 text-base sm:text-lg">✓</span>
                  <span>Brza isplata</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 text-base sm:text-lg">✓</span>
                  <span>Provizija samo 15€ po turi</span>
                </li>
              </ul>
              <Button 
                size="lg" 
                className="w-full h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                onClick={() => handleSelectRole('vozac')}
                disabled={loading}
              >
                {loading ? 'Čuvanje...' : 'Nastavi kao Vozač'}
              </Button>
            </CardContent>
          </Card>

          {/* Poslodavac */}
          <Card className="border-2 hover:border-primary hover:shadow-xl transition-all">
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="mx-auto mb-3 sm:mb-4 bg-primary/10 p-4 sm:p-5 md:p-6 rounded-full">
                <Building2 className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl mb-2">Poslodavac</CardTitle>
              <CardDescription className="text-sm sm:text-base px-2">
                Pronađite pouzdane vozače za vaše transportne potrebe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 text-base sm:text-lg">✓</span>
                  <span>Brzo objavljivanje tura</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 text-base sm:text-lg">✓</span>
                  <span>Verifikovani vozači</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 text-base sm:text-lg">✓</span>
                  <span>Praćenje statusa tura</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 text-base sm:text-lg">✓</span>
                  <span>Bez skrivenih troškova</span>
                </li>
              </ul>
              <Button 
                size="lg" 
                className="w-full h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                onClick={() => handleSelectRole('poslodavac')}
                disabled={loading}
              >
                {loading ? 'Čuvanje...' : 'Nastavi kao Poslodavac'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

