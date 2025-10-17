'use client'

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="happy-card mx-auto max-w-md space-y-4 px-8 py-10 text-center text-rose-600">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
        ❗
      </div>
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-rose-500">
        {error?.message || 'Let’s give that another try.'}
      </p>
      <button onClick={resetErrorBoundary} className="happy-button-primary">
        Try again
      </button>
    </div>
  )
}
