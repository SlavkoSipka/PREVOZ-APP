import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Building2, Shield, CheckCircle2, Clock, CreditCard } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold">TransLink</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" asChild size="sm" className="text-xs sm:text-sm">
              <Link href="/prijava">Prijavi se</Link>
            </Button>
            <Button asChild size="sm" className="text-xs sm:text-sm">
              <Link href="/registracija">Registruj se</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          Poveži firme i vozače <span className="text-primary">lako</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
          TransLink spaja firme i kamiondžije. Brzo, sigurno i jednostavno. 
          Pronađi ture ili objavi potrebu za prevozom odmah.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-xl mx-auto px-2">
          <Button size="lg" asChild className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto touch-manipulation">
            <Link href="/registracija?uloga=vozac">
              <Truck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Registruj se kao vozač
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto touch-manipulation">
            <Link href="/registracija?uloga=firma">
              <Building2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Registruj se kao firma
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Kako funkcioniše?</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Za Firme */}
          <Card className="border-2 hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
            <CardHeader className="pb-3">
              <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3" />
              <CardTitle className="text-xl sm:text-2xl">Za Firme</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Objavi turu i pronađi proveren vozača
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 sm:space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Registruj se i verifikuj firmu</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Objavi turu sa detaljima</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Admin odobrava najbolje vozače</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Direktna komunikacija sa vozačem</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Za Vozače */}
          <Card className="border-2 border-primary hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
            <CardHeader className="pb-3">
              <Truck className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3" />
              <CardTitle className="text-xl sm:text-2xl">Za Vozače</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Pronađi ture i zarađuj vožnjom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 sm:space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Registruj se kao vozač</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Pregledaj dostupne ture</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Prijavi se i čekaj odobrenje</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Završi posao i plati proviziju</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Admin Kontrola */}
          <Card className="border-2 hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
            <CardHeader className="pb-3">
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3" />
              <CardTitle className="text-xl sm:text-2xl">Sigurnost</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Admin tim brine o kvalitetu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 sm:space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Verifikacija svih korisnika</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Ručno odobravanje vozača</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Zaštita plaćanja</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Podrška 24/7</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Zašto TransLink?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Brzo i Efikasno</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Pronađi vozača ili turu za nekoliko minuta
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Sigurno</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Svi korisnici su verifikovani i provereni
              </p>
            </div>
            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="bg-primary/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CreditCard className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Transparentno</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Jasne cene i provizije, bez skrivenih troškova
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Spreman da počneš?</h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
          Pridruži se TransLink platformi danas i poveži se sa stotinama firmi i vozača
        </p>
        <Button size="lg" asChild className="text-sm sm:text-base md:text-lg px-8 sm:px-10 py-4 sm:py-6 touch-manipulation">
          <Link href="/registracija">
            Registruj se odmah
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-base sm:text-lg font-bold">TransLink</span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm text-center">
              © 2024 TransLink. Sva prava zadržana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

