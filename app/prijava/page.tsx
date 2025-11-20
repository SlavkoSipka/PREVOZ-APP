'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'
import { signIn } from '@/lib/auth-helpers.client'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

export default function PrijavaPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  useEffect(() => {
    // Proveri da li je korisnik već ulogovan
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Učitaj profil
        const { data: profile } = await supabase
          .from('users')
          .select('uloga, profil_popunjen')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          // Redirect na pravi dashboard
          if (profile.uloga === 'admin') router.push('/admin')
          else if (profile.uloga === 'poslodavac') {
            if (!profile.profil_popunjen) router.push('/poslodavac-onboarding')
            else router.push('/poslodavac')
          }
          else if (profile.uloga === 'vozac') router.push('/vozac')
        }
      }
    }
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        toast({
          title: 'Greška pri prijavi',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      if (data.user) {
        // Učitaj profil da bi znali gde da redirektujemo
        const { data: profile } = await supabase
          .from('users')
          .select('uloga, profil_popunjen')
          .eq('id', data.user.id)
          .single()

        toast({
          title: 'Uspešna prijava!',
          description: 'Dobrodošli nazad.',
        })

        // Redirect logika - prvo proveri da li ima ulogu
        if (!profile || !profile.uloga) {
          // Nema uloga → select-role
          router.push('/select-role')
        } else if (profile.uloga === 'admin') {
          router.push('/admin')
        } else if (!profile.profil_popunjen) {
          // Ima ulogu ali nije popunio profil → onboarding
          const onboardingPath = profile.uloga === 'vozac' ? '/vozac-onboarding' : '/poslodavac-onboarding'
          router.push(onboardingPath)
        } else {
          // Sve popunjeno → dashboard
          const dashboardPath = profile.uloga === 'vozac' ? '/vozac' : '/poslodavac'
          router.push(dashboardPath)
        }
        router.refresh()
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Došlo je do neočekivane greške.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center pb-4 sm:pb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-primary/10 p-2.5 sm:p-3 rounded-full">
              <Truck className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Prijavi se</CardTitle>
          <CardDescription className="text-sm sm:text-base px-2">
            Unesite svoje podatke da pristupite nalogu
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email adresa</Label>
              <Input
                id="email"
                type="email"
                placeholder="ime@primer.rs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-10 sm:h-11 text-base"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Lozinka</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-10 sm:h-11 text-base"
              />
            </div>
            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base touch-manipulation" disabled={loading}>
              {loading ? 'Prijavljivanje...' : 'Prijavi se'}
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm">
            <span className="text-gray-600">Nemaš nalog? </span>
            <Link href="/registracija" className="text-primary hover:underline font-medium inline-block min-h-[44px] flex items-center justify-center touch-manipulation">
              Registruj se ovde
            </Link>
          </div>

          <div className="mt-3 sm:mt-4 text-center">
            <Link href="/" className="text-xs sm:text-sm text-gray-600 hover:text-primary inline-block min-h-[44px] flex items-center justify-center touch-manipulation">
              ← Nazad na početnu
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

