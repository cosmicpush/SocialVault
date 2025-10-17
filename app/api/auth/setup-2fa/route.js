import { authenticator } from 'otplib'
import prisma from '@/utils/prisma'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request) {
  try {
    const { userId } = await request.json()

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate new secret
    const secret = authenticator.generateSecret()
    const otpauth_url = authenticator.keyuri(
      user.username,
      'BharatiyanNews',
      secret
    )

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpauth_url)

    // Save the secret to user (but don't enable 2FA yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFASecret: secret,
        twoFAEnabled: false,
      },
    })

    return NextResponse.json({ secret, qrCodeUrl })
  } catch (error) {
    console.error('2FA Setup Error:', error)
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 })
  }
}
