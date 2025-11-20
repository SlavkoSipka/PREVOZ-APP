'use client'

import { Button } from '@/components/ui/button'
import { Calendar, User, Truck, Info } from 'lucide-react'
import Link from 'next/link'
import { ApproveDriverButton } from './approve-driver-button'

interface Prijava {
  id: string
  status: string
  created_at: string
  tura: {
    id: string
    polazak: string
    destinacija: string
    datum: string
    ponudjena_cena: number
  }
  vozac: {
    id: string
    puno_ime: string
    telefon: string
  }
}

export function PrijaveList({ prijave }: { prijave: Prijava[] }) {
  if (!prijave || prijave.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Trenutno nema prijava koje čekaju odobrenje
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {prijave.map((prijava) => (
        <div 
          key={prijava.id} 
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-3 flex-1">
              {/* Tura info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {prijava.tura.polazak} → {prijava.tura.destinacija}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(prijava.tura.datum).toLocaleDateString('sr-RS')}
                  </span>
                  <span className="font-semibold text-primary">
                    {prijava.tura.ponudjena_cena} €
                  </span>
                </div>
              </div>

              {/* Vozač info */}
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-semibold text-sm text-gray-700 mb-2">Vozač:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {prijava.vozac.puno_ime}
                  </div>
                  <div className="text-gray-600">
                    📞 {prijava.vozac.telefon}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Prijavljen: {new Date(prijava.created_at).toLocaleString('sr-RS')}
              </p>
            </div>

            {/* Akcije */}
            <div className="flex md:flex-col gap-2">
              <Button
                asChild
                variant="outline"
                className="w-full md:flex-initial"
              >
                <Link href={`/admin/ture/${prijava.tura.id}`}>
                  <Info className="mr-2 h-4 w-4" />
                  Pogledaj sve detalje
                </Link>
              </Button>
              <ApproveDriverButton 
                prijavaId={prijava.id}
                vozacId={prijava.vozac.id}
                turaId={prijava.tura.id}
                turaInfo={{
                  polazak: prijava.tura.polazak,
                  destinacija: prijava.tura.destinacija,
                  datum: prijava.tura.datum
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

