import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if maintenance mode is enabled (defaults to true)
  const isMaintenanceMode = process.env.MAINTENANCE_MODE !== "false" && process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "false"

  if (isMaintenanceMode) {
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
    const isMaintenancePage = pathname === '/maintenance'
    const isStaticAsset = 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/images') || 
      pathname.startsWith('/favicon.ico') || 
      pathname.includes('.')

    if (!isAdminRoute && !isMaintenancePage && !isStaticAsset) {
      if (pathname.startsWith('/api')) {
        return new NextResponse(
          JSON.stringify({ error: "Website is under maintenance. Please try again later." }),
          { status: 503, headers: { 'content-type': 'application/json' } }
        )
      }
      const maintenanceUrl = new URL('/maintenance', request.url)
      return NextResponse.redirect(maintenanceUrl)
    }
  } else {
    if (pathname === '/maintenance') {
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  // Only protect /admin routes (not API — those have their own requireAdmin guards)
  if (pathname.startsWith('/admin')) {
    // Skip protection for the login page itself
    if (pathname === '/admin/login') {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
}
