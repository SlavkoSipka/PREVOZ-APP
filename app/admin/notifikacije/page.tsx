import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { Navbar } from '@/components/dashboard/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminNotifikacijePage() {
  const userData = await getUserWithProfile()

  if (!userData || userData.profile.uloga !== 'admin') {
    redirect('/prijava')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData.profile} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Bell className="mr-2 h-6 w-6" />
              Admin Notifikacije
            </CardTitle>
            <CardDescription>
              Sistemske notifikacije i upozorenja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              Nemate novih notifikacija
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

