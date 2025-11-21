'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle } from 'lucide-react'

function RegistracijaContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 sm:p-5 md:p-6 rounded-full">
              <Mail className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold px-2">Proverite svoj email</CardTitle>
          <CardDescription className="text-sm sm:text-base px-2">
            Poslali smo verifikacioni link na vašu email adresu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {email && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-blue-800 mb-1">Email poslat na:</p>
              <p className="font-semibold text-blue-900 text-sm sm:text-base break-all">{email}</p>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-2.5 sm:space-x-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm sm:text-base">Korak 1: Otvorite email</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Potražite email od PreveziMe-a u vašem inboxu
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 sm:space-x-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm sm:text-base">Korak 2: Kliknite na link</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Kliknite na dugme ili link za verifikaciju naloga
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 sm:space-x-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm sm:text-base">Korak 3: Popunite profil</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Bićete automatski preusmereni da popunite preostale podatke
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm font-medium text-gray-700">💡 Saveti:</p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
              <li>• Proverite i spam folder ako ne vidite email</li>
              <li>• Email bi trebalo da stigne za nekoliko sekundi</li>
              <li>• Link je važeći 24 sata</li>
            </ul>
          </div>

          {timeLeft > 0 ? (
            <div className="text-center text-xs sm:text-sm text-gray-500 px-2">
              Možete zatvoriti ovu stranicu. Email stiže za {timeLeft}s...
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-3">Niste dobili email?</p>
              <button 
                className="text-primary hover:underline font-medium text-sm sm:text-base min-h-[44px] touch-manipulation"
                onClick={() => window.location.reload()}
              >
                Pošalji ponovo
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegistracijaUspesnoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 sm:p-5 md:p-6 rounded-full">
                <Mail className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">Učitavanje...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <RegistracijaContent />
    </Suspense>
  )
}

