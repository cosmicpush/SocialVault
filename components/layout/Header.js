'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield } from 'lucide-react'

export function Header() {
  const pathname = usePathname()

  // Don't show header on homepage
  if (pathname === '/') return null

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 shadow-sm backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 text-2xl font-cursive text-fuchsia-600 shadow-lg shadow-fuchsia-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
            <Shield className="h-5 w-5 animate-sway" />
          </span>
          SocialVault
        </Link>
        <p className="hidden items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-md shadow-slate-200/80 md:flex">
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400"></span>
          Secure, cheerful credential management
        </p>
      </div>
    </header>
  )
}
