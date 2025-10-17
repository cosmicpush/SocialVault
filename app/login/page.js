// app/login/page.js
'use client'
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    twoFactorCode: '',
  })
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const [error, setError] = useState('')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!recaptchaToken) {
      setError('Please complete the ReCAPTCHA')
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credentials,
          recaptchaToken,
        }),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (response.status === 401 && data.require2FA) {
        setRequiresTwoFactor(true)
        setError('')
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.success) {
        window.location.replace(data.redirect || '/')
      }
    } catch (error) {
      setError(error.message)
      console.error('Login error:', error)
    }
  }

  return (
    <div className="happy-container">
      <div className="mx-auto max-w-3xl">
        <section className="happy-card relative overflow-hidden px-8 py-12 shadow-2xl">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-rose-200/60 blur-3xl animate-floaty"></div>
          <div className="pointer-events-none absolute bottom-6 right-6 h-24 w-24 rounded-full bg-sky-200/60 blur-2xl animate-sparkle"></div>

          <div className="text-center">
            <h2 className="font-cursive text-4xl text-fuchsia-600">Welcome back</h2>
            <p className="mt-2 text-lg font-semibold text-slate-700">
              Unlock your cheerful SocialVault workspace
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="happy-label">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="happy-input"
                required
              />
            </div>

            <div>
              <label className="happy-label">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="happy-input"
                required
              />
            </div>

            {requiresTwoFactor && (
              <div>
                <label className="happy-label">2FA Code</label>
                <input
                  type="text"
                  value={credentials.twoFactorCode}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      twoFactorCode: e.target.value,
                    })
                  }
                  className="happy-input tracking-[0.4em] text-center text-lg"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength="6"
                  required
                />
                <p className="mt-2 text-sm text-slate-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-inner">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={setRecaptchaToken}
                  theme="light"
                />
              </div>
            </div>

            <button type="submit" className="happy-button-primary w-full">
              {requiresTwoFactor ? 'Verify 2FA' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
