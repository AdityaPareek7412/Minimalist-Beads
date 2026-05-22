import { NextRequest, NextResponse } from "next/server"
import { setAdminCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    // Hard-fail if env vars are missing — no fallbacks allowed
    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD environment variable not set")
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      )
    }

    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable not set")
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      )
    }

    if (email === adminEmail && password === adminPassword) {
      const response = NextResponse.json({
        success: true,
        message: "Logged in successfully",
      })

      // Set HMAC-signed cookie — never the raw secret
      setAdminCookie(response, jwtSecret)

      return response
    } else {
      // Generic message — don't reveal which field is wrong
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    )
  }
}
