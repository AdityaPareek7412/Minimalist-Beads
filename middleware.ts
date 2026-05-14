import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip protection for the login page itself
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    const adminToken = request.cookies.get('admin_token')?.value
    const expectedSecret = process.env.JWT_SECRET || "fallback_secret"

    if (!adminToken || adminToken !== expectedSecret) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configure which paths middleware should run on
export const config = {
  matcher: ['/admin/:path*'],
}
