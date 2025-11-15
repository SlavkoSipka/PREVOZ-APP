import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home } from 'lucide-react'

export default function PlacanjeUspesnoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-green-700">
            Plaćanje uspešno!
          </CardTitle>
          <CardDescription className="text-base text-green-600">
            Vaša provizija je uspešno plaćena
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Vaš nalog je sada ponovo aktivan. Možete nastaviti da prihvatate nove ture 
              i koristite sve funkcionalnosti TransLink platforme.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Potvrda o plaćanju je poslata na vašu email adresu.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/vozac">
                <Home className="mr-2 h-5 w-5" />
                Nazad na Dashboard
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Hvala što koristite TransLink platformu!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

