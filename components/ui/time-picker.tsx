'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'

interface TimePickerProps {
  value?: string
  onChange: (time: string) => void
  disabled?: boolean
  placeholder?: string
}

export function TimePicker({
  value = '',
  onChange,
  disabled,
  placeholder = 'HH:MM (npr. 08:30)',
}: TimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d:]/g, '')
    
    if (val.length === 2 && !val.includes(':')) {
      val = val + ':'
    }
    
    if (val.length <= 5) {
      onChange(val)
    }
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={5}
    />
  )
}

