import './globals.css'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata = {
  title: 'SocialVault',
  description: 'Personal Account Manager',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/android-chrome-192x192.png',
        color: '#5bbad5',
      },
      {
        rel: 'msapplication-TileImage',
        url: '/mstile-144x144.png',
      },
      {
        rel: 'msapplication-square70x70logo',
        url: '/mstile-70x70.png',
      },
      {
        rel: 'msapplication-square150x150logo',
        url: '/mstile-150x150.png',
      },
      {
        rel: 'msapplication-wide310x150logo',
        url: '/mstile-310x150.png',
      },
      {
        rel: 'msapplication-square310x310logo',
        url: '/mstile-310x310.png',
      },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} relative min-h-screen overflow-x-hidden bg-transparent`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-fuchsia-200/50 blur-3xl animate-floaty"></div>
          <div className="absolute -right-20 top-40 h-96 w-96 rounded-full bg-sky-200/60 blur-3xl animate-sway"></div>
          <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-100/70 blur-[140px] animate-sparkle"></div>
          <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl animate-floaty"></div>
        </div>
        <div className="relative z-10 flex min-h-screen w-full flex-col overflow-x-hidden">
          <Header />
          <main className="flex-grow w-full">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
