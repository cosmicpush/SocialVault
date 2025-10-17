import Link from 'next/link'
import { FaShieldAlt, FaHome } from 'react-icons/fa'
import './not-found.css'

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="happy-card relative mx-auto space-y-8 px-10 py-14 text-center md:px-16">
        <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 rounded-full bg-violet-200/60 blur-3xl animate-floaty"></div>
        <div className="pointer-events-none absolute right-6 top-6 h-24 w-24 rounded-full bg-rose-200/60 blur-2xl animate-sparkle"></div>

        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-400 to-amber-300 text-white shadow-xl animate-floaty">
          <FaShieldAlt className="h-14 w-14" />
        </div>

        <h1 className="text-6xl font-bold text-slate-800">404</h1>

        <h2 className="text-3xl font-cursive text-fuchsia-600">Oops! Page Missing</h2>

        <p className="mx-auto max-w-md text-lg text-slate-500">
          Looks like this page is locked away somewhere else. Head back home
          and explore other parts of SocialVault.
        </p>

        <Link
          href="/"
          className="happy-button-primary inline-flex"
        >
          <FaHome className="text-xl" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
