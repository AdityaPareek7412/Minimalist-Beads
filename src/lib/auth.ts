// src/lib/auth.ts
// Centralized admin authentication helper
// Uses HMAC-SHA256 signed token — never stores raw secrets in cookies

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const COOKIE_NAME = "admin_token"

/** Generate a signed token from a payload string */
export function signToken(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const sig = hmac.digest("hex")
  // Format: base64(payload).signature
  const encodedPayload = Buffer.from(payload).toString("base64url")
  return `${encodedPayload}.${sig}`
}

/** Verify a signed token — returns payload string or null */
export function verifyToken(token: string, secret: string): string | null {
  try {
    const [encodedPayload, sig] = token.split(".")
    if (!encodedPayload || !sig) return null

    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8")
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")

    // Use timingSafeEqual to prevent timing attacks
    const sigBuf = Buffer.from(sig, "hex")
    const expectedBuf = Buffer.from(expectedSig, "hex")
    if (sigBuf.length !== expectedBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null

    return payload
  } catch {
    return null
  }
}

/** Check if the incoming request has a valid admin cookie.
 *  Returns null if authenticated, or a 401 NextResponse if not. */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error("JWT_SECRET environment variable is not set")
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    )
  }

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized — please log in" },
      { status: 401 }
    )
  }

  const payload = verifyToken(token, secret)
  if (!payload || !payload.startsWith("admin:")) {
    return NextResponse.json(
      { error: "Unauthorized — invalid session" },
      { status: 401 }
    )
  }

  return null // authenticated ✅
}

/** Set the admin session cookie on a response */
export function setAdminCookie(response: NextResponse, secret: string): void {
  const payload = `admin:${Date.now()}`
  const token = signToken(payload, secret)

  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

/** Clear the admin session cookie */
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
}
