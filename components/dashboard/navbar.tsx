'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Truck, LogOut, User, Bell, LayoutDashboard, ListIcon } from 'lucide-react'
import { signOut } from '@/lib/auth-helpers.client'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavbarProps {
  user: {
    id: string
    email: string
    puno_ime: string
    uloga: string
  }
  currentPage?: string
}

export function Navbar({ user, currentPage }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [neprocitaneNotifikacije, setNeprocitaneNotifikacije] = useState(0)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  // Ensure component is mounted before rendering dynamic content
  useEffect(() => {
    setMounted(true)
  }, [])

  // Učitaj broj nepročitanih notifikacija za vozače i poslodavce
  useEffect(() => {
    if ((user.uloga !== 'vozac' && user.uloga !== 'poslodavac') || !mounted) return

    const loadNotifikacije = async () => {
      const { count } = await supabase
        .from('notifikacije')
        .select('*', { count: 'exact', head: true })
        .eq('vozac_id', user.id)
        .eq('procitano', false)

      setNeprocitaneNotifikacije(count || 0)
    }

    loadNotifikacije()

    // Real-time subscription za notifikacije
    const channel = supabase
      .channel('navbar-notifikacije')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifikacije',
          filter: `vozac_id=eq.${user.id}`
        },
        () => {
          loadNotifikacije()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id, user.uloga, mounted])

  const handleSignOut = async () => {
    try {
      // 1. Server-side logout
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // 2. Client-side logout (čisti localStorage, sessionStorage, cookies)
      await signOut()
      
      toast({
        title: 'Odjavljeni ste',
        description: 'Uspešno ste se odjavili sa naloga.',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 3. Hard redirect bez Next.js router cache-a
      window.location.href = '/'
    }
  }

  // Proveri da li je trenutna stranica aktivan link
  const isActive = (path: string) => {
    return pathname === path || currentPage === path
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold">TransLink</span>
          </div>

          {/* Navigacioni linkovi za poslodavce */}
          {user.uloga === 'poslodavac' && (
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant={isActive('/poslodavac/feed') || isActive('feed') ? "default" : "ghost"} 
                size="sm" 
                asChild
              >
                <Link href="/poslodavac/feed" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Objave
                </Link>
              </Button>
              <Button 
                variant={isActive('/poslodavac') || isActive('dashboard') ? "default" : "ghost"} 
                size="sm" 
                asChild
              >
                <Link href="/poslodavac" className="flex items-center gap-2">
                  <ListIcon className="h-4 w-4" />
                  Moje ture
                </Link>
              </Button>
            </div>
          )}

          {/* Navigacioni linkovi za vozače */}
          {user.uloga === 'vozac' && (
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant={isActive('/vozac') || isActive('objave') ? "default" : "ghost"} 
                size="sm" 
                asChild
              >
                <Link href="/vozac" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Objave
                </Link>
              </Button>
              <Button 
                variant={isActive('/vozac/prijave') || isActive('prijave') ? "default" : "ghost"} 
                size="sm" 
                asChild
              >
                <Link href="/vozac/prijave" className="flex items-center gap-2">
                  <ListIcon className="h-4 w-4" />
                  Moje prijave
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifikacije za vozače */}
          {user.uloga === 'vozac' && (
            <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 sm:h-10 sm:w-10 touch-manipulation">
              <Link href="/vozac/notifikacije">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {neprocitaneNotifikacije > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-semibold">
                    {neprocitaneNotifikacije > 9 ? '9+' : neprocitaneNotifikacije}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {/* Notifikacije za poslodavce */}
          {user.uloga === 'poslodavac' && (
            <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 sm:h-10 sm:w-10 touch-manipulation">
              <Link href="/poslodavac/notifikacije">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {neprocitaneNotifikacije > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-semibold">
                    {neprocitaneNotifikacije > 9 ? '9+' : neprocitaneNotifikacije}
                  </span>
                )}
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1.5 sm:gap-2 h-9 px-2 sm:h-10 sm:px-3 touch-manipulation">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm sm:text-base truncate max-w-[120px] md:max-w-[200px]">{user.puno_ime}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)]">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm sm:text-base truncate">{user.puno_ime}</span>
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Mobilni linkovi za poslodavce */}
              {user.uloga === 'poslodavac' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/poslodavac/feed" className="md:hidden">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Objave
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/poslodavac" className="md:hidden">
                      <ListIcon className="mr-2 h-4 w-4" />
                      Moje ture
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/poslodavac/notifikacije" className="md:hidden relative">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifikacije
                      {neprocitaneNotifikacije > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                          {neprocitaneNotifikacije}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                </>
              )}

              {/* Mobilni linkovi za vozače */}
              {user.uloga === 'vozac' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/vozac" className="md:hidden">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Objave
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/vozac/prijave" className="md:hidden">
                      <ListIcon className="mr-2 h-4 w-4" />
                      Moje prijave
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/vozac/notifikacije" className="md:hidden relative">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifikacije
                      {neprocitaneNotifikacije > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                          {neprocitaneNotifikacije}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                </>
              )}
              
              <DropdownMenuItem asChild className="touch-manipulation">
                <Link href={`/${user.uloga}/profil`} className="min-h-[44px] flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 touch-manipulation min-h-[44px]">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Odjavi se</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

