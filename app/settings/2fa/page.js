// app/settings/2fa/page.js
'use client'
import { useState } from 'react'

export default function Setup2FAPage() {
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const setupInitial2FA = async () => {
    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 }),
      })

      const data = await response.json()
      if (response.ok) {
        setQrCode(data.qrCodeUrl)
        setSecret(data.secret)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to setup 2FA')
    }
  }

  const verifyAndEnable2FA = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, token }),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        setError('')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to verify token')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 font-cursive">
          Setup Two-Factor Authentication
        </h2>

        {!qrCode && (
          <button
            onClick={setupInitial2FA}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white p-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Begin 2FA Setup
          </button>
        )}

        {qrCode && !success && (
          <div className="space-y-6">
            <div>
              <p className="mb-4 text-gray-700">
                1. Scan this QR code with your authenticator app:
              </p>
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <img src={qrCode} alt="2FA QR Code" width={200} height={200} />
              </div>
            </div>

            <div>
              <p className="mb-2 text-gray-700">
                2. Or manually enter this code:
              </p>
              <code className="block p-3 bg-gray-100 rounded-lg text-purple-600 font-mono">
                {secret}
              </code>
            </div>

            <form onSubmit={verifyAndEnable2FA} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  3. Enter the 6-digit code from your authenticator app:
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full p-3 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  required
                  pattern="[0-9]*"
                  maxLength="6"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white p-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Verify and Enable 2FA
              </button>
            </form>
          </div>
        )}

        {success && (
          <div className="text-green-600 text-center bg-green-50 p-4 rounded-lg border border-green-200">
            <p>🎉 2FA has been successfully enabled!</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
