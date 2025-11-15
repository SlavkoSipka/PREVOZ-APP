import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Shield, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AdminProfilPage() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'admin') {
    redirect('/prijava')
  }

  const profile = userData.profile

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ ...profile, id: userData.user.id }} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Link>
        </Button>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Shield className="mr-2 h-6 w-6 text-purple-600" />
                Admin Profil
              </CardTitle>
              <CardDescription>
                Vaši podaci i administratorska prava
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ime i prezime</p>
                    <p className="font-semibold">{profile.puno_ime}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Admin od</p>
                    <p className="font-semibold">
                      {new Date(profile.created_at).toLocaleDateString('sr-RS')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Shield className="h-5 w-5 mr-3 mt-0.5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Uloga</p>
                    <p className="font-semibold text-purple-600">Administrator</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800">Administratorska prava</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-purple-700">
              <p>✓ Odobravanje vozača za ture</p>
              <p>✓ Pregled svih korisnika</p>
              <p>✓ Upravljanje uplatama</p>
              <p>✓ Pristup svim turama</p>
              <p>✓ Sistemske notifikacije</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Podešavanja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Ažuriraj profil
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Promeni lozinku
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

