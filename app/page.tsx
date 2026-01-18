'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Truck, Building2, Shield, CheckCircle2, Clock, CreditCard, 
  TrendingUp, Users, Star, ArrowRight, Sparkles, Zap,
  BadgeCheck, FileCheck, MessageSquare, ChevronRight
} from 'lucide-react'

export default function HomePage({
  searchParams,
}: {
  searchParams: { error?: string; reason?: string; details?: string }
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Uklonjena lažna statistika - aplikacija je nova

  const features = [
    {
      icon: Shield,
      title: 'Verifikovani vozači',
      description: 'Svi vozači prolaze kroz proces verifikacije dokumenata i background provere',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Zap,
      title: 'Brzo povezivanje',
      description: 'Algoritam automatski predlaže najbolje kandidate za svaku turu',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: BadgeCheck,
      title: 'Admin kontrola',
      description: 'Svaka prijava prolazi kroz ručnu proveru admina pre odobrenja',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: CreditCard,
      title: 'Sigurno plaćanje',
      description: 'Integrisani sistem plaćanja sa zaštitom za obe strane',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: FileCheck,
      title: 'Provera dokumenata',
      description: 'Automatska provera valjanosti saobraćajnih dozvola i registracija',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: MessageSquare,
      title: 'Direktna komunikacija',
      description: 'Ugrađen sistem notifikacija za brzu komunikaciju',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Registruj se',
      description: 'Kreiraj nalog za firmu ili vozača za manje od 3 minuta',
      icon: Users
    },
    {
      number: '02',
      title: 'Verifikuj profil',
      description: 'Uploaduj dokumenta i čekaj verifikaciju admina',
      icon: BadgeCheck
    },
    {
      number: '03',
      title: 'Pronađi ili objavi',
      description: 'Vozači pregledaju ture, firme objavljuju potrebe',
      icon: TrendingUp
    },
    {
      number: '04',
      title: 'Započni saradnju',
      description: 'Admin odobrava najbolje kandidate i započinje posao',
      icon: CheckCircle2
    },
  ]

  const testimonials = [
    {
      name: 'Marko Petrović',
      role: 'Nezavisni vozač',
      text: 'Pre PreveziMe sam gubio sate tražeći ture. Sad za 10 minuta nađem posao i sve je transparentno.',
      rating: 5,
      image: '👨‍💼'
    },
    {
      name: 'Transport d.o.o.',
      role: 'Logistička firma',
      text: 'Konačno platforma gde možemo brzo naći proverne vozače. Verifikacija dokumenata je odlična stvar!',
      rating: 5,
      image: '🏢'
    },
    {
      name: 'Jovan Nikolić',
      role: 'Vozač kamiona',
      text: 'Provizija je fer, sistem je pouzdan, i admin tim je uvek tu da pomogne. Preporučujem!',
      rating: 5,
      image: '🚚'
    },
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        
        html {
          scroll-behavior: smooth;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .btn-glow:hover {
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
        }
      `}</style>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 group">
            <div className="relative">
              <Truck className="h-7 w-7 sm:h-9 sm:w-9 text-primary transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              PreveziMe
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              asChild 
              size="sm" 
              className="text-xs sm:text-sm hover:bg-green-50 transition-all duration-300"
            >
              <Link href="/prijava">Prijavi se</Link>
            </Button>
            <Button 
              asChild 
              size="sm" 
              className="text-xs sm:text-sm btn-glow transition-all duration-300 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Link href="/registracija">Registruj se</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {searchParams.error && (
        <div className="container mx-auto px-4 sm:px-6 pt-6 animate-fade-in-up">
          <div className="mb-6 mx-auto max-w-2xl">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-left shadow-lg">
              <h3 className="text-red-800 font-semibold mb-2">
                ⚠️ Greška pri prijavljivanju
              </h3>
              <p className="text-sm text-red-700 mb-2">
                {searchParams.error === 'auth_failed' 
                  ? 'Prijavljivanje nije uspelo.'
                  : searchParams.error === 'no_session'
                  ? 'Nije kreirana sesija nakon prijavljivanja.'
                  : 'Došlo je do greške pri prijavljivanju.'}
              </p>
              {searchParams.reason && (
                <p className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                  Detalji: {decodeURIComponent(searchParams.reason)}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.clear()
                      sessionStorage.clear()
                      window.location.href = '/prijava'
                    }
                  }}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Pokušaj ponovo
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/prijava">Email prijava</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 gradient-shift">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-200"></div>
        
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28 text-center relative z-10">
          <div className={`transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6 animate-pulse-glow">
              <Sparkles className="h-4 w-4" />
              <span>Platforma #1 za povezivanje firmi i vozača</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight px-2">
              <span className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 bg-clip-text text-transparent">
                Poveži, prevezi, zaradi
              </span>
              <br />
              <span className="text-gray-800">brzo i sigurno</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4 leading-relaxed">
              Moderna platforma koja spaja <span className="font-semibold text-green-600">firme</span> sa provjerenim{' '}
              <span className="font-semibold text-blue-600">vozačima</span>. Bez posrednika, bez čekanja.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto px-4 mb-10 sm:mb-12">
              <Button 
                size="lg" 
                asChild 
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 sm:py-6 md:py-7 btn-glow bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-xl transition-all duration-300 group w-full sm:w-auto"
              >
                <Link href="/registracija?uloga=vozac" className="flex items-center justify-center">
                  <Truck className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                  Vozač - Nađi ture
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 sm:py-6 md:py-7 border-2 hover:bg-green-50 hover:border-green-600 shadow-lg transition-all duration-300 group w-full sm:w-auto"
              >
                <Link href="/registracija?uloga=firma" className="flex items-center justify-center">
                  <Building2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                  Firma - Objavi turu
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-600 px-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span>Verifikovani</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span>Sigurno</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                <span>Brzo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Launch Banner */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-green-50 via-white to-blue-50 border-y border-green-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Glavni banner */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 sm:px-8 sm:py-5">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300 animate-pulse" />
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                    🎉 Beta Verzija - Potpuno BESPLATNO!
                  </h2>
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300 animate-pulse" />
                </div>
              </div>
              
              <div className="p-6 sm:p-8 md:p-10 space-y-6">
                {/* Glavna poruka */}
                <div className="text-center space-y-3">
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-800 font-semibold">
                    Budite među prvima koji će koristiti novu platformu!
                  </p>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    PreveziMe je <span className="font-bold text-green-600">potpuno nova platforma</span> koja povezuje poslodavce i vozače. 
                    Trenutno smo u <span className="font-bold text-blue-600">beta fazi</span> i želimo da što više ljudi testira aplikaciju!
                  </p>
                </div>

                {/* Benefiti */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Nema provizije</h3>
                      <p className="text-sm text-gray-600">Koristite platformu potpuno besplatno dok je u beta verziji</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Rani korisnici</h3>
                      <p className="text-sm text-gray-600">Budite deo razvoja i pomozite nam da napravimo najbolju platformu</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <Star className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Povlašćeni uslovi</h3>
                      <p className="text-sm text-gray-600">Rani korisnici će imati posebne benefite i kada uvedemo proviziju</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <Users className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Direktan uticaj</h3>
                      <p className="text-sm text-gray-600">Vaš feedback direktno utiče na razvoj novih funkcija</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-6 text-center border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">
                    Registracija je potpuno besplatna i traje manje od 3 minuta
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
                      <Link href="/registracija?uloga=vozac">
                        <Truck className="mr-2 h-5 w-5" />
                        Registruj se kao vozač
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-2 border-green-600 hover:bg-green-50">
                      <Link href="/registracija?uloga=firma">
                        <Building2 className="mr-2 h-5 w-5" />
                        Registruj se kao firma
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in-up px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
              Sve što ti treba na{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                jednom mestu
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Kompletan ekosistem za upravljanje transportom sa najboljim funkcijama u industriji
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index}
                  className={`card-hover border-2 hover:border-green-200 cursor-pointer animate-fade-in-up delay-${(index + 1) * 100}`}
                >
                  <CardContent className="p-5 sm:p-6 md:p-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl ${feature.bgColor} mb-3 sm:mb-4 md:mb-6 transition-transform hover:scale-110 duration-300`}>
                      <Icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in-up px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
              Kako funkcioniše?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Jednostavan proces u 4 koraka
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div 
                    key={index}
                    className={`relative animate-fade-in-up delay-${(index + 1) * 200}`}
                  >
                    <div className="flex gap-3 sm:gap-4 md:gap-6">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-lg sm:text-xl md:text-2xl shadow-lg">
                            {step.number}
                          </div>
                          {index < steps.length - 1 && (
                            <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-green-400 to-transparent"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 pt-1 sm:pt-2">
                        <div className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-green-100 mb-2 sm:mb-3 md:mb-4">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2 md:mb-3 text-gray-900">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in-up px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
              Šta kažu naši korisnici
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Pridruži se stotinama zadovoljnih vozača i firmi
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === activeTestimonial
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95 absolute top-0 left-0 w-full'
                  }`}
                >
                  <Card className="border-2 shadow-2xl">
                    <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12 text-center">
                      <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">
                        {testimonial.image}
                      </div>
                      <div className="flex justify-center gap-0.5 sm:gap-1 mb-4 sm:mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 sm:mb-6 md:mb-8 italic leading-relaxed px-2">
                        "{testimonial.text}"
                      </p>
                      <div className="font-semibold text-base sm:text-lg md:text-xl text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 text-sm sm:text-base">
                        {testimonial.role}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeTestimonial
                        ? 'bg-green-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-blue-600 gradient-shift"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center text-white">
          <div className="animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 px-2">
              Spreman za početak?
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed px-4">
              Pridruži se stotinama vozača i firmi koji već koriste PreveziMe. 
              Registracija je besplatna i traje manje od 3 minuta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto px-2">
              <Button 
                size="lg" 
                asChild 
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 bg-white text-green-700 hover:bg-gray-100 shadow-2xl transition-all duration-300 group w-full sm:w-auto"
              >
                <Link href="/registracija" className="flex items-center justify-center">
                  Registruj se besplatno
                  <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 border-2 border-white text-white hover:bg-white/10 shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <Link href="/prijava">
                  Već imam nalog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="h-8 w-8 text-green-500" />
                <span className="text-2xl font-bold text-white">PreveziMe</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Moderna platforma koja povezuje firme sa provjerenim vozačima. 
                Brzo, sigurno i transparentno.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Brzi linkovi</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/registracija" className="hover:text-green-500 transition-colors duration-200">
                    Registracija
                  </Link>
                </li>
                <li>
                  <Link href="/prijava" className="hover:text-green-500 transition-colors duration-200">
                    Prijava
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Kontakt</h3>
              <p className="text-gray-400">
                Email: podrska@prevezime.rs<br />
                Tel: +381 61 309 1583
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 PreveziMe. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
