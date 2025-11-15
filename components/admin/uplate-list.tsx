'use client'

import { CheckCircle, XCircle, Clock, Euro } from 'lucide-react'

interface Uplata {
  id: string
  iznos: number
  status: string
  created_at: string
  checkout_id?: string
  vozac: {
    puno_ime: string
    telefon: string
  }
  tura: {
    polazak: string
    destinacija: string
  }
}

export function UplateList({ uplate }: { uplate: Uplata[] }) {
  if (!uplate || uplate.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Još nema uplata u sistemu
      </div>
    )
  }

  const statusColors = {
    placeno: 'text-green-600',
    u_toku: 'text-yellow-600',
    neuspesno: 'text-red-600',
  }

  const statusIcons = {
    placeno: <CheckCircle className="h-4 w-4" />,
    u_toku: <Clock className="h-4 w-4" />,
    neuspesno: <XCircle className="h-4 w-4" />,
  }

  const statusLabels = {
    placeno: 'Plaćeno',
    u_toku: 'U toku',
    neuspesno: 'Neuspešno',
  }

  return (
    <div className="space-y-3">
      {uplate.map((uplata) => (
        <div 
          key={uplata.id} 
          className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{uplata.vozac.puno_ime}</h3>
                <span className={`flex items-center gap-1 text-sm font-medium ${statusColors[uplata.status as keyof typeof statusColors]}`}>
                  {statusIcons[uplata.status as keyof typeof statusIcons]}
                  {statusLabels[uplata.status as keyof typeof statusLabels]}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Tura: {uplata.tura.polazak} → {uplata.tura.destinacija}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(uplata.created_at).toLocaleString('sr-RS')}
              </p>
              {uplata.checkout_id && (
                <p className="text-xs text-gray-400">
                  ID: {uplata.checkout_id}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary flex items-center">
                <Euro className="h-5 w-5 mr-1" />
                {uplata.iznos}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

