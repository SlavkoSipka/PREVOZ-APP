'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Truck } from 'lucide-react'
import { signUp, signInWithGoogle } from '@/lib/auth-helpers.client'
import { useToast } from '@/hooks/use-toast'

export default function RegistracijaPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast({
          title: 'Greška',
          description: error.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Došlo je do greške sa Google registracijom.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Kreiraj nalog</CardTitle>
          <CardDescription className="text-base">
            Nakon registracije izaberi tip naloga
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email adresa</Label>
              <Input
                id="email"
                type="email"
                placeholder="ime@primer.rs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-gray-500">Minimum 6 karaktera</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? 'Kreiranje naloga...' : 'Kreiraj nalog'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Ili</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Nastavi sa Google
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Već imate nalog? </span>
            <Link href="/prijava" className="text-primary hover:underline font-medium">
              Prijavite se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
