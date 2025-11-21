import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home } from 'lucide-react'

export default function PlacanjeUspesnoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-green-100 p-3 sm:p-4 rounded-full">
              <CheckCircle className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-green-700">
            Plaćanje uspešno!
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-green-600 px-2">
            Vaša provizija je uspešno plaćena
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-green-800">
              Vaš nalog je sada ponovo aktivan. Možete nastaviti da prihvatate nove ture 
              i koristite sve funkcionalnosti PreveziMe platforme.
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm text-gray-600">
              Potvrda o plaćanju je poslata na vašu email adresu.
            </p>
            <Button asChild size="lg" className="w-full h-11 sm:h-12 text-sm sm:text-base touch-manipulation">
              <Link href="/vozac">
                <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Nazad na Dashboard
              </Link>
            </Button>
          </div>

          <div className="pt-3 sm:pt-4 border-t">
            <p className="text-xs text-gray-500">
              Hvala što koristite PreveziMe platformu!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

