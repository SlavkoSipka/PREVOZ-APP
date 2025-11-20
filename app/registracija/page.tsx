'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Truck } from 'lucide-react'
import { signUp } from '@/lib/auth-helpers.client'
import { useToast } from '@/hooks/use-toast'

export default function RegistracijaPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await signUp(
        email,
        password,
        {
          puno_ime: '',
          telefon: '',
          uloga: null as any, // Još ne znamo ulogu
        },
        { emailRedirectTo: `${window.location.origin}/select-role` }
      )

      if (error) {
        toast({
          title: 'Greška pri registraciji',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      router.push(`/registracija/uspesno?email=${encodeURIComponent(email)}`)
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
          <CardTitle className="text-2xl sm:text-3xl font-bold">Kreiraj nalog</CardTitle>
          <CardDescription className="text-sm sm:text-base px-2">
            Nakon registracije izaberi tip naloga
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
                minLength={6}
                className="h-10 sm:h-11 text-base"
              />
              <p className="text-xs text-gray-500">Minimum 6 karaktera</p>
            </div>

            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base touch-manipulation" disabled={loading}>
              {loading ? 'Kreiranje naloga...' : 'Kreiraj nalog'}
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm">
            <span className="text-gray-600">Već imate nalog? </span>
            <Link href="/prijava" className="text-primary hover:underline font-medium inline-block min-h-[44px] flex items-center justify-center touch-manipulation">
              Prijavite se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
