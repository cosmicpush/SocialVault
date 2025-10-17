'use client'

import FacebookAccountManager from '@/components/FacebookAccountManager'
import { ErrorBoundary } from 'react-error-boundary'
import { X } from 'lucide-react'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="happy-card max-w-lg mx-auto p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
        <X className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-semibold text-rose-600 mb-3">
        Oops, a little hiccup!
      </h2>
      <p className="mb-6 text-slate-500">
        {error.message ||
          'We ran into a snag loading your vault. Give it another go?'}
      </p>
      <button onClick={resetErrorBoundary} className="happy-button-primary">
        Try again
      </button>
    </div>
  )
}

export default function FacebookAccountsPage() {
  // Add error event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.log('Detailed error information:', {
        message: event.error?.message,
        stack: event.error?.stack,
        type: event.error?.name,
        source: event.filename,
        lineNo: event.lineno,
        colNo: event.colno,
        timestamp: new Date().toISOString(),
      })
    })
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <div className="happy-container space-y-10">
        <section className="happy-card px-6 py-10 text-center md:px-12 md:py-12">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-fuchsia-600 shadow-sm">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400"></span>
            Live vault workspace
          </div>
          <h1 className="mt-5 text-4xl font-bold text-slate-800 md:text-5xl">
            Facebook Accounts made friendly and fun
          </h1>
          <p className="mt-4 text-lg text-slate-600 md:text-xl">
            Organize every credential with playful clarity, instant filtering,
            and real-time security cues that keep your team smiling.
          </p>
        </section>

        <FacebookAccountManager />
      </div>
    </ErrorBoundary>
  )
}
