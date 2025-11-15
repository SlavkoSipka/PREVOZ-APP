import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatira vreme iz HH:MM:SS u HH:MMh format
export function formatVreme(vreme: string | null | undefined): string {
  if (!vreme) return ''
  // Ako je već u HH:MM formatu, dodaj 'h'
  if (vreme.length === 5 && vreme.includes(':')) return `${vreme}h`
  // Ako je u HH:MM:SS formatu, izvuci samo HH:MM i dodaj 'h'
  const parts = vreme.split(':')
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}h`
  }
  return vreme
}

