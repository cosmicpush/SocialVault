// utils/2fa.js
import { authenticator } from 'otplib'
// Import commented out since it's not used in current code
// import QRCode from 'qrcode'

// Existing function for generating 2FA codes
export function generate2FACode(secret) {
  try {
    return authenticator.generate(secret)
  } catch (error) {
    console.error('Error generating 2FA code:', error)
    return '------'
  }
}

// New function for initial 2FA setup

// New function for verifying 2FA tokens

// New function to generate QR code for 2FA setup

// New function to validate token format
