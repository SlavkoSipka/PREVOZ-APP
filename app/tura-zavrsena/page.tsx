import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home, Sparkles, Heart } from 'lucide-react'

export default function TuraZavrsenaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-2xl text-center shadow-xl border-2 border-green-200">
        <CardHeader className="px-4 sm:px-6 pb-4">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 sm:p-6 rounded-full shadow-lg">
                <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl sm:text-4xl md:text-5xl text-green-700 mb-3">
            🎉 Čestitamo!
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-gray-700 px-2">
            Tura je uspešno završena
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
          {/* Beta verzija poruka */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-4 sm:p-6 shadow-md">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="h-6 w-6 text-red-500" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Hvala vam!
              </h3>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-gray-700">
              <p className="leading-relaxed">
                <span className="font-semibold text-green-700">PreveziMe</span> je trenutno u 
                <span className="font-semibold text-blue-700"> početnoj beta fazi</span>, 
                što znači da platformu možete koristiti potpuno <span className="font-bold text-green-600">besplatno</span>!
              </p>
              <p className="leading-relaxed">
                <span className="font-semibold">Nema provizije, nema skrivenih troškova</span> - 
                samo kvalitetan servis i prilika da budete deo nečeg novog i uzbudljivog.
              </p>
              <div className="bg-white/60 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-xs sm:text-sm text-gray-600 italic">
                  💡 Vaše mišljenje nam je veoma važno dok razvijamo platformu. 
                  Slobodno nas kontaktirajte sa povratnim informacijama!
                </p>
              </div>
            </div>
          </div>

          {/* Šta dalje? */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
            <h4 className="font-semibold text-blue-900 mb-3 text-base sm:text-lg">
              Šta dalje?
            </h4>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span>Poslodavac će biti obavešten o završetku ture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span>Poslodavac može da vas oceni i ostavi komentar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span>Možete odmah nastaviti da pregledate i prihvatate nove ture</span>
              </li>
            </ul>
          </div>

          {/* CTA Dugme */}
          <div className="pt-2">
            <Button 
              asChild 
              size="lg" 
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/vozac">
                <Home className="mr-2 h-5 w-5" />
                Nazad na Dashboard
              </Link>
            </Button>
          </div>

          {/* Footer poruka */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Hvala što koristite <span className="font-semibold text-green-600">PreveziMe</span>!
            </p>
            <p className="text-xs text-gray-500">
              Zajedno gradimo bolju budućnost za transport industriju 🚚💚
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
