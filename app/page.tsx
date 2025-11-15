import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Building2, Shield, CheckCircle2, Clock, CreditCard } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TransLink</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/prijava">Prijavi se</Link>
            </Button>
            <Button asChild>
              <Link href="/registracija">Registruj se</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Poveži firme i vozače <span className="text-primary">lako</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          TransLink spaja firme i kamiondžije. Brzo, sigurno i jednostavno. 
          Pronađi ture ili objavi potrebu za prevozom odmah.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link href="/registracija?uloga=vozac">
              <Truck className="mr-2 h-5 w-5" />
              Registruj se kao vozač
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
            <Link href="/registracija?uloga=firma">
              <Building2 className="mr-2 h-5 w-5" />
              Registruj se kao firma
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Kako funkcioniše?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Za Firme */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Za Firme</CardTitle>
              <CardDescription className="text-base">
                Objavi turu i pronađi proveren vozača
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Registruj se i verifikuj firmu</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Objavi turu sa detaljima</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Admin odobrava najbolje vozače</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Direktna komunikacija sa vozačem</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Za Vozače */}
          <Card className="border-2 border-primary hover:shadow-lg transition-shadow">
            <CardHeader>
              <Truck className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Za Vozače</CardTitle>
              <CardDescription className="text-base">
                Pronađi ture i zarađuj vožnjom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Registruj se kao vozač</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pregledaj dostupne ture</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Prijavi se i čekaj odobrenje</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Završi posao i plati proviziju</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Admin Kontrola */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Sigurnost</CardTitle>
              <CardDescription className="text-base">
                Admin tim brine o kvalitetu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Verifikacija svih korisnika</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ručno odobravanje vozača</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Zaštita plaćanja</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Podrška 24/7</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Zašto TransLink?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Brzo i Efikasno</h3>
              <p className="text-gray-600">
                Pronađi vozača ili turu za nekoliko minuta
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sigurno</h3>
              <p className="text-gray-600">
                Svi korisnici su verifikovani i provereni
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparentno</h3>
              <p className="text-gray-600">
                Jasne cene i provizije, bez skrivenih troškova
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Spreman da počneš?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Pridruži se TransLink platformi danas i poveži se sa stotinama firmi i vozača
        </p>
        <Button size="lg" asChild className="text-lg px-10 py-6">
          <Link href="/registracija">
            Registruj se odmah
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Truck className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">TransLink</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 TransLink. Sva prava zadržana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

