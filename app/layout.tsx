import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ClearCacheOnMount } from '@/components/clear-cache-on-mount'
import { MobileConsole } from '@/components/mobile-console'
import { VersionChecker } from '@/components/version-checker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PreveziMe - Platforma za transport',
  description: 'Povežite poslodavce i vozače - brzo, efikasno, sigurno',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PreveziMe'
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
        <VersionChecker />
        <ClearCacheOnMount />
        <MobileConsole />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
