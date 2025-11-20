'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'

interface OptimizedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  showLoader?: boolean
  prefetch?: boolean
}

/**
 * Optimized Link component with instant feedback and smooth transitions
 */
export function OptimizedLink({ 
  href, 
  children, 
  className, 
  showLoader = true,
  prefetch = true 
}: OptimizedLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsNavigating(true)
    
    startTransition(() => {
      router.push(href)
      // Reset after navigation
      setTimeout(() => setIsNavigating(false), 500)
    })
  }

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      prefetch={prefetch}
    >
      {showLoader && (isPending || isNavigating) && (
        <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Link>
  )
}

