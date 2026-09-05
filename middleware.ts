import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Known bad bots, AI crawlers, and scrapers that caused Cloudinary/Vercel overages
const BLOCKED_USER_AGENTS = [
  // AI Crawlers (caused the June 2026 spike)
  'gptbot', 'chatgpt-user', 'ccbot', 'anthropic-ai', 'claude-web',
  'google-extended', 'meta-externalagent', 'bytespider', 'amazonbot',
  'applebot-extended', 'cohere-ai', 'perplexitybot', 'youbot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'blexbot',
  // Generic scrapers
  'python-requests', 'go-http-client', 'axios/', 'scrapy',
  'curl/', 'wget/', 'libwww-perl', 'java/', 'okhttp',
  'petalbot', 'sogou', 'baiduspider', 'yandexbot',
]

// Sensitive paths that bots commonly probe for
const BLOCKED_PATHS = [
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.env.backup',
  '/.env.bak',
  '/.env.example',
  '/.env.development',
  '/.git',
  '/wp-admin',
  '/wp-login.php',
  '/phpinfo.php',
  '/config.php',
  '/.htaccess',
  '/.htpasswd',
  '/server.js',
  '/docker-compose.yml',
  '/Dockerfile',
  '/.vite',
  '/.next/required-server-files.json',
  // Phantom API paths — don't exist in this codebase but are probed by bots/AI scanners
  // Blocking here at the Edge eliminates Lambda invocations for these 404s
  '/api/demo',
  '/api/blog',
  '/api/generate',
  '/api/chat',
  '/api/ai',
  '/api/gpt',
  '/api/openai',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block known bad bots & AI crawlers by User-Agent — 403 immediately
  // This fires BEFORE any path checks, saving CPU and bandwidth
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase()
  if (!userAgent || BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse(null, { status: 403 })
  }

  // Block bot probes for sensitive files — return 404 immediately
  const isBlockedPath = BLOCKED_PATHS.some(
    (blocked) => pathname === blocked || pathname.startsWith(blocked + '/')
  )
  if (isBlockedPath) {
    return new NextResponse(null, { status: 404 })
  }

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|images-cdn).*)'],
}
