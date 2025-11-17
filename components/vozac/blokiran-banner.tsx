'use client'

import { AlertCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface BlokiranBannerProps {
  ukupnoDug?: number
}

export function BlokiranBanner({ ukupnoDug }: BlokiranBannerProps) {
  return (
    <Card className="mb-6 border-2 border-red-500 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-bold text-red-900">
              ⚠️ Vaš nalog je blokiran - Neophodno je plaćanje
            </h3>
            <p className="text-sm text-red-800">
              Ваш налог је привремено блокиран због неплаћених провизија. 
              <strong className="block mt-1">Не можете прихватити нове туре док не намирите дуговања.</strong>
            </p>
            <p className="text-sm text-red-700">
              Можете наставити да користите апликацију и видите своје туре, 
              али прихватање нових тура је онемогућено док не извршите уплату.
            </p>
            {ukupnoDug !== undefined && ukupnoDug > 0 && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-900">
                  Укупан дуг: <span className="text-xl ml-2">{ukupnoDug.toFixed(2)} €</span>
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/uplata-obavezna">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Измири дуговања
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

