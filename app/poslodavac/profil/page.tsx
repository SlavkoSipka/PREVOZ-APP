import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Building2, Calendar, Shield, ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function PoslodavacProfilPage() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'poslodavac') {
    redirect('/prijava')
  }

  const profile = userData.profile

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/poslodavac">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Link>
        </Button>

        <div className="grid gap-6">
          {/* Osnovne informacije */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Informacije o poslodavcu</CardTitle>
              <CardDescription>
                Vaši podaci i informacije o kompaniji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ime i prezime</p>
                    <p className="font-semibold">{profile.puno_ime || `${profile.ime} ${profile.prezime}`}</p>
                  </div>
                </div>

                {profile.naziv_firme && (
                  <div className="flex items-start">
                    <Building2 className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Naziv firme</p>
                      <p className="font-semibold">{profile.naziv_firme}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefon</p>
                    <p className="font-semibold">{profile.telefon}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Grad</p>
                    <p className="font-semibold">{profile.grad || 'Nije navedeno'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Član od</p>
                    <p className="font-semibold">
                      {new Date(profile.created_at).toLocaleDateString('sr-RS')}
                    </p>
                  </div>
                </div>
              </div>

              {profile.opis && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-500 mb-2">O poslodavcu</p>
                  <p className="text-gray-700">{profile.opis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status naloga */}
          <Card>
            <CardHeader>
              <CardTitle>Status naloga</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✅ Nalog je aktivan</p>
                <p className="text-sm text-green-700 mt-1">
                  Vaš nalog je u potpunosti funkcionalan i možete objavljivati ture.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

