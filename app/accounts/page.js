import Link from 'next/link'
import Image from 'next/image'
import { Zap } from 'lucide-react'

const accountSpaces = [
  {
    name: 'Facebook',
    description:
      'Manage Facebook credentials with encryption, tags, and real-time 2FA.',
    status: 'Available',
    iconPath: '/icons/facebook.svg',
    href: '/facebook-accounts',
    accent: 'from-[#0866ff] via-[#4978ff] to-[#6c8bff]',
  },
  {
    name: 'Instagram',
    description:
      'Coordinate creator accounts, recovery flows, and message access securely.',
    status: 'Coming soon',
    iconPath: '/icons/instagram.svg',
    href: null,
    accent: 'from-[#f58529] via-[#dd2a7b] to-[#8134af]',
  },
  {
    name: 'Gmail',
    description:
      'Vault inbox credentials, app passwords, and delegated access notes.',
    status: 'Coming soon',
    iconPath: '/icons/gmail.svg',
    href: null,
    accent: 'from-[#ea4335] via-[#fbbc04] to-[#34a853]',
  },
  {
    name: 'Outlook',
    description:
      'Centralize Microsoft accounts, shared mailboxes, and recovery flows.',
    status: 'Coming soon',
    iconPath: '/icons/outlook.svg',
    href: null,
    accent: 'from-[#0078d4] via-[#1e90ff] to-[#5bb1ff]',
  },
]

export default function AccountsPage() {
  return (
    <div className="happy-container space-y-10">
      <section className="happy-card px-8 py-12 text-center md:px-12">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-fuchsia-600 shadow-sm">
          <Zap className="h-4 w-4" />
          SocialVault Spaces
        </div>
        <h1 className="mt-5 text-4xl font-bold text-slate-800 md:text-5xl">
          Choose the vault you want to open today
        </h1>
        <p className="mt-4 text-lg text-slate-600 md:text-xl">
          Facebook is live and humming. Instagram, Gmail, Microsoft Outlook and more are
          lining up for a playful launch soon.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {accountSpaces.map((space) => {
          const cardContent = (
            <div className="happy-card h-full p-7 text-left transition-all duration-300">
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${space.accent} text-white shadow-lg`}
              >
                <Image
                  src={space.iconPath}
                  alt={`${space.name} logo`}
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800">
                {space.name}
              </h2>
              <p className="mt-3 text-slate-500">{space.description}</p>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                    space.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  {space.status}
                </span>
                {space.href ? (
                  <span className="text-fuchsia-500">Open vault →</span>
                ) : (
                  <span className="text-slate-400">Stay tuned</span>
                )}
              </div>
            </div>
          )

          if (space.href) {
            return (
              <Link
                key={space.name}
                href={space.href}
                className="group focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-200"
              >
                {cardContent}
              </Link>
            )
          }

          return (
            <div
              key={space.name}
              className="happy-card relative overflow-hidden opacity-70"
            >
              {cardContent}
              <div className="pointer-events-none absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
