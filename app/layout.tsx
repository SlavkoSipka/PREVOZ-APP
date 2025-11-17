import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ClearCacheOnMount } from '@/components/clear-cache-on-mount'
import { MobileConsole } from '@/components/mobile-console'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TransLink - Platforma za transport',
  description: 'Povežite poslodavce i vozače - brzo, efikasno, sigurno',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TransLink'
  },
  formatDetection: {
    telephone: false
  }
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
        <ClearCacheOnMount />
        <MobileConsole />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
