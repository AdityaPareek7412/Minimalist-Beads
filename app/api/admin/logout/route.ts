import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })
  
  // Clear the cookie
  response.cookies.delete("admin_token")
  
  return response
}
