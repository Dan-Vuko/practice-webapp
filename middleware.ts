import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page and auth API
  if (pathname === '/login' || pathname === '/api/auth') {
    return NextResponse.next()
  }

  // Check authentication cookie
  const authCookie = request.cookies.get('portal_auth')?.value
  const correctPassword = process.env.AUTH_PASSWORD

  if (authCookie === correctPassword) {
    return NextResponse.next()
  }

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: [
    '/',
    '/speedbuilder/:path*',
    '/api/workouts/:path*'
  ]
}
