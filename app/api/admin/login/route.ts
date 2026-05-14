import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret"

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ success: false, error: "Admin credentials not configured" }, { status: 500 })
    }

    if (email === adminEmail && password === adminPassword) {
      // Create response and set cookie
      const response = NextResponse.json({ success: true, message: "Logged in successfully" })
      
      // Basic session cookie - In production, use jose to encode a proper JWT
      response.cookies.set({
        name: "admin_token",
        value: jwtSecret,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })

      return response
    } else {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}
