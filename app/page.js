import Link from 'next/link'
import { Shield, Sparkles, Smile, Stars } from 'lucide-react'

export default function Home() {
  return (
    <div className="happy-container space-y-16">
      <section className="relative overflow-hidden happy-card px-8 py-14 lg:px-14">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-200/60 blur-3xl animate-floaty"></div>
        <div className="pointer-events-none absolute bottom-8 left-10 h-24 w-24 rounded-full bg-amber-100/80 blur-2xl animate-sparkle"></div>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="space-y-6 lg:w-3/5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-fuchsia-600 shadow-md shadow-fuchsia-100">
              <Sparkles className="h-4 w-4" />
              Welcome to SocialVault
            </div>
            <h1 className="text-4xl font-bold text-slate-800 md:text-5xl lg:text-6xl">
              Joyfully secure account management for your entire crew
            </h1>
            <p className="max-w-2xl text-lg text-slate-600 md:text-xl">
              Keep every credential safe, organized, and delightfully accessible.
              SocialVault wraps enterprise-grade encryption in a playful, happy
              workspace your team will love using every day.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/accounts" className="happy-button-primary">
                <Shield className="h-4 w-4" /> Open the vault
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <Stars className="h-4 w-4 text-amber-500" />
                AES-256 Encryption
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <Smile className="h-4 w-4 text-emerald-500" />
                Friendly 2FA workflow
              </div>
            </div>
          </div>

          <div className="relative flex w-full justify-center lg:w-2/5">
            <div className="relative h-full w-full max-w-sm">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 opacity-70 blur-2xl animate-floaty"></div>
              <div className="happy-card relative flex flex-col items-center gap-6 px-10 py-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 text-white shadow-lg animate-floaty">
                  <Shield className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-800">
                  One comfy home for every login
                </h3>
                <p className="text-base text-slate-500">
                  Drag-and-drop organization, instant tag filtering, and
                  real-time TOTP codes keep your team smiling and productive.
                </p>
                <span className="text-sm font-semibold text-slate-400">
                  More vaults coming soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        {[
          {
            title: 'Playful productivity',
            description:
              'Animated cues and delightful statuses make managing serious credentials feel light and friendly.',
            iconBg: 'from-fuchsia-400 via-purple-400 to-indigo-400',
          },
          {
            title: 'Always-on safety',
            description:
              'Encrypted storage, backup scripts, and audit-friendly logs protect what matters most.',
            iconBg: 'from-emerald-400 via-teal-400 to-sky-400',
          },
          {
            title: 'Team-ready sharing',
            description:
              'Simple permissions, export flows, and maintenance helpers keep everyone in sync.',
            iconBg: 'from-amber-400 via-orange-400 to-rose-400',
          },
        ].map((feature, index) => (
          <div
            key={feature.title}
            className={`happy-card p-8 ${index % 2 === 0 ? 'animate-floaty' : 'animate-sway'}`}
          >
            <div
              className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.iconBg} text-white shadow-lg`}
            >
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-800">
              {feature.title}
            </h3>
            <p className="text-slate-600">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
