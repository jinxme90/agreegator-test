import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Navigation } from '@/components/layout/Navigation'
import { MobileNav } from '@/components/layout/MobileNav'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'UX Radar — Daily Design & Tech Feed',
  description: 'Premium curated feed for UX Design, Technology, AI, Product Design, and Gadgets',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-gray-950 min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navigation />
          <main className="pb-20 md:pb-0">{children}</main>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
