'use client'

import * as React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TimePickerProps {
  value?: string // Format: "HH:MM"
  onChange: (time: string) => void
  disabled?: boolean
  placeholder?: string
}

export function TimePicker({
  value = '',
  onChange,
  disabled,
  placeholder = 'Izaberite vreme',
}: TimePickerProps) {
  const [hours, setHours] = React.useState(value ? value.split(':')[0] : '')
  const [minutes, setMinutes] = React.useState(value ? value.split(':')[1] : '')

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
      const formatted = val.padStart(2, '0')
      setHours(val)
      if (val.length === 2 && minutes) {
        onChange(`${formatted}:${minutes.padStart(2, '0')}`)
      }
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
      const formatted = val.padStart(2, '0')
      setMinutes(val)
      if (hours && val.length === 2) {
        onChange(`${hours.padStart(2, '0')}:${formatted}`)
      }
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="text-sm font-semibold text-center">Unesite vreme (24h format)</div>
          
          {/* Manual input */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="HH"
                value={hours}
                onChange={handleHoursChange}
                maxLength={2}
                className="text-center text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground text-center mt-1">Sati</p>
            </div>
            <span className="text-2xl font-bold">:</span>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="MM"
                value={minutes}
                onChange={handleMinutesChange}
                maxLength={2}
                className="text-center text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground text-center mt-1">Minuti</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

