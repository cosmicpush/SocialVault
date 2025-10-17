import { authenticator } from 'otplib'
import prisma from '@/utils/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId, token } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.twoFASecret) {
      return NextResponse.json({ error: 'Invalid setup' }, { status: 400 })
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFASecret,
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Enable 2FA for the user
    await prisma.user.update({
      where: { id: userId },
      data: { twoFAEnabled: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('2FA Verification Error:', error)
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 })
  }
}
