import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// BOT BLOCKLIST
// These are scrapers, AI trainers, and commercial crawlers that:
//   1. Don't respect robots.txt
//   2. Generate large amounts of egress by hammering APIs / pages
//   3. Are NOT needed for SEO or link previews
//
// ⚠️  Do NOT add social preview bots (linkedinbot, twitterbot, facebookexternalhit,
//     duckduckbot) — they are needed for link previews on WhatsApp/Instagram/Twitter.
// ─────────────────────────────────────────────────────────────────────────────
const BLOCKED_USER_AGENTS = [
  // AI Training Crawlers — caused the August 2026 egress spike
  'gptbot', 'chatgpt-user', 'ccbot', 'anthropic-ai', 'claude-web', 'claudebot',
  'google-extended', 'meta-externalagent', 'bytespider', 'amazonbot',
  'applebot-extended', 'cohere-ai', 'perplexitybot', 'youbot',
  'oai-searchbot', 'omgili', 'omgilibot', 'img2dataset', 'laion',
  'diffbot', 'scraperapi', 'scrapingbee', 'zyte',

  // SEO / Paid scraper bots — high-volume, no SEO value for us
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'blexbot',
  'petalbot', 'dataforseo', 'rogerbot',

  // Generic scraper libraries / headless tools
  'python-requests', 'go-http-client', 'scrapy',
  'libwww-perl', 'okhttp', 'heritrix',

  // Regional spam crawlers
  'sogou', 'baiduspider', 'yandexbot',

  // Archive crawlers that generate huge egress (they download every page)
  'ia_archiver', 'archive.org_bot',
]

// ─────────────────────────────────────────────────────────────────────────────
// PHANTOM PATHS — bots probe these paths even though they don't exist.
// Blocking at Edge = zero Lambda invocations for these 404s.
// ─────────────────────────────────────────────────────────────────────────────
const BLOCKED_PATHS = [
  // Sensitive files
  '/.env', '/.env.local', '/.env.production', '/.env.backup',
  '/.env.bak', '/.env.example', '/.env.development',
  '/.git', '/.htaccess', '/.htpasswd', '/.vite',
  '/.next/required-server-files.json',
  '/server.js', '/config.php', '/phpinfo.php',
  '/docker-compose.yml', '/Dockerfile',
  // WordPress probes (we're not WP but bots try anyway)
  '/wp-admin', '/wp-login.php', '/xmlrpc.php',
  '/wp-content', '/wp-includes',
  // Phantom API paths probed by AI scanners / exploit kits
  '/api/demo', '/api/blog', '/api/generate', '/api/chat',
  '/api/ai', '/api/gpt', '/api/openai', '/api/graphql',
  '/api/v1', '/api/v2', '/graphql',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Block bad bots by User-Agent ────────────────────────────────────────
  // Empty UA = almost certainly a bot/scanner. Block immediately.
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase()
  if (!userAgent || BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse(null, { status: 403 })
  }

  // ── 2. Block phantom path probes ───────────────────────────────────────────
  const isBlockedPath = BLOCKED_PATHS.some(
    (blocked) => pathname === blocked || pathname.startsWith(blocked + '/')
  )
  if (isBlockedPath) {
    return new NextResponse(null, { status: 404 })
  }

  // ── 3. Maintenance mode ────────────────────────────────────────────────────
  const isMaintenanceMode =
    process.env.MAINTENANCE_MODE !== 'false' &&
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== 'false'

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
          JSON.stringify({ error: 'Website is under maintenance. Please try again later.' }),
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

  // ── 4. Admin route protection ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()

    // Edge Runtime compatible: check cookie presence.
    // Full HMAC verification is done per-route via requireAdmin().
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Basic structural check: our signed tokens always have format "base64.hexsig"
    const parts = token.split('.')
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which paths middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|images-cdn).*)'],
}

