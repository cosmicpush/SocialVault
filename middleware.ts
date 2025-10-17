'use client'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const bypassAuth = isDevelopment && process.env.BYPASS_AUTH === 'true'

export function middleware(request: NextRequest) {
  // Skip auth check for public paths
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Development bypass
  if (isDevelopment && bypassAuth) {
    return NextResponse.next()
  }

  // Check for authentication
  const sessionToken = request.cookies.get('session-token')
  const isAuthenticated = request.cookies.get('authenticated')
  
  if (!sessionToken || !isAuthenticated) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}