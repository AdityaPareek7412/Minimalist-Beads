import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /admin routes (not API — those have their own requireAdmin guards)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip protection for the login page itself
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Edge Runtime compatible: just check cookie presence
    // Actual HMAC signature verification is done in each API route via requireAdmin()
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Basic structural check: our signed tokens always have format "base64.hexsig"
    const parts = token.split('.')
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configure which paths middleware should run on
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
