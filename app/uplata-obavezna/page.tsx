import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth-helpers.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CreditCard, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { TestPaymentButton } from '@/components/payment/test-payment-button'

export default async function UplataObaveznaPage() {
  const userData = await getUserWithProfile()

  if (!userData) {
    redirect('/prijava')
  }

  const supabase = await createServerSupabaseClient()

  // Učitavanje neplaćenih uplata
  const { data: uplate } = await supabase
    .from('uplate')
    .select(`
      *,
      tura:ture(polazak, destinacija)
    `)
    .eq('vozac_id', userData.user.id)
    .eq('status', 'u_toku')
    .order('created_at', { ascending: false })

  // Ako nema neplaćenih uplata i nije blokiran, preusmerava nazad
  if (!userData.profile.blokiran && (!uplate || uplate.length === 0)) {
    redirect(`/${userData.profile.uloga}`)
  }

  // Kalkulacija ukupnog duga
  const ukupnoDug = uplate?.reduce((sum: number, u: any) => sum + parseFloat(u.iznos), 0) || 0

  // Test mode check
  const testMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

  // 2Checkout konfiguracija (samo za produkciju)
  const merchantCode = process.env.NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE
  const checkoutUrl = merchantCode 
    ? `https://secure.2checkout.com/checkout/buy?merchant=${merchantCode}&dynamic=1&prod=TransLink_Provizija&price=${ukupnoDug}&qty=1&return-url=${process.env.NEXT_PUBLIC_SITE_URL}/placanje-uspesno&return-type=redirect`
    : '#'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-2xl border-red-300">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-red-100 p-3 sm:p-4 rounded-full">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-red-700">Nalog je blokiran</CardTitle>
          <CardDescription className="text-sm sm:text-base text-red-600 px-2">
            Morate izvršiti uplatu provizije da biste nastavili korišćenje platforme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Test Mode Banner */}
          {testMode && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 sm:p-4">
              <p className="text-blue-800 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">🧪 TEST MODE AKTIVAN</p>
              <p className="text-xs sm:text-sm text-blue-700">
                Aplikacija je u test fazi. Plaćanje je simulirano i nećete biti naplaćeni.
                Kliknite dugme ispod da simulirate uspešno plaćanje.
              </p>
            </div>
          )}

          {/* Info o blokiranju */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-red-800 mb-1.5 sm:mb-2 text-sm sm:text-base">Zašto je moj nalog blokiran?</h3>
            <p className="text-xs sm:text-sm text-red-700">
              Nakon završetka ture, svi vozači su dužni da plate proviziju kako bi nastavili 
              korišćenje TransLink platforme. Vaš nalog će biti automatski odblokiran čim 
              uplata bude potvrđena.
            </p>
          </div>

          {/* Lista neplaćenih tura */}
          {uplate && uplate.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Neplaćene provizije:</h3>
              <div className="space-y-2">
                {uplate.map((uplata: any) => (
                  <div 
                    key={uplata.id} 
                    className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-white border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {uplata.tura?.polazak} → {uplata.tura?.destinacija}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(uplata.created_at).toLocaleDateString('sr-RS')}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-lg sm:text-xl font-bold text-red-600">
                        {uplata.iznos} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ukupan iznos */}
          <div className="border-t pt-3 sm:pt-4">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <span className="text-lg sm:text-xl font-semibold">Ukupan dug:</span>
              <span className="text-2xl sm:text-3xl font-bold text-red-600">{ukupnoDug.toFixed(2)} €</span>
            </div>

            {/* Dugme za plaćanje - TEST ili PRAVO */}
            {testMode ? (
              <TestPaymentButton 
                vozacId={userData.user.id}
                uplateIds={uplate?.map(u => u.id) || []}
                iznos={ukupnoDug}
              />
            ) : (
              <Button 
                size="lg" 
                className="w-full h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                asChild
                disabled={!merchantCode}
              >
                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                  <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Plati odmah preko 2Checkout
                </a>
              </Button>
            )}
          </div>

          {/* Informacije o plaćanju */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-blue-800">
                <p className="font-semibold mb-1">Šta se dešava nakon plaćanja?</p>
                <p>
                  {testMode 
                    ? 'U test modu, nalog će biti odmah odblokiran nakon simulacije plaćanja.'
                    : 'Nakon uspešne uplate, naš sistem će automatski primiti potvrdu i vaš nalog će biti odmah odblokiran. Moći ćete ponovo da prihvatate nove ture.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Link za podršku */}
          <div className="text-center text-xs sm:text-sm text-gray-600">
            <p>
              Imate problem? {' '}
              <Link href="/" className="text-primary hover:underline touch-manipulation inline-block min-h-[44px] flex items-center justify-center">
                Kontaktirajte podršku
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
