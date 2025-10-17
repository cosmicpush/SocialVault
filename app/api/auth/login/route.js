// app/api/auth/login/route.js
import prisma from '@/utils/prisma'
import { encrypt, decrypt } from '@/utils/crypto'
import { authenticator } from 'otplib'
// eslint-disable-next-line no-unused-vars
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { username, password, twoFactorCode } = await request.json()

    console.log('Login attempt:', {
      username,
      hasPassword: !!password,
      hasTwoFactorCode: !!twoFactorCode,
    })

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const storedDecrypted = decrypt(user.password)
    const passwordMatches = password === storedDecrypted

    if (!passwordMatches) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (user.twoFAEnabled) {
      if (!twoFactorCode) {
        return NextResponse.json(
          {
            error: '2FA code required',
            require2FA: true,
          },
          { status: 401 }
        )
      }

      const isValid = authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFASecret,
      })

      console.log('2FA verification:', {
        provided: twoFactorCode,
        isValid,
      })

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 })
      }
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Create session with full user data
    const sessionData = {
      userId: user.id,
      username: user.username,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    // Set session cookies with correct configuration
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    }

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      redirect: '/',
    })

    // Set cookies on the response object
    response.cookies.set(
      'session-token',
      encrypt(JSON.stringify(sessionData)),
      cookieOptions
    )
    response.cookies.set('authenticated', 'true', {
      ...cookieOptions,
      httpOnly: false,
      sameSite: 'strict',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
