import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

// GET is public — needed by Header to show announcement, and checkout for shipping fees
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" }
    })

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "default",
          shippingFee: 80,
          freeShippingLimit: 500,
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // 🔒 Admin only — only POST (write) requires auth, GET is public
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const data = await req.json()
    const { shippingFee, freeShippingLimit, announcement } = data

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        shippingFee: parseFloat(shippingFee),
        freeShippingLimit: parseFloat(freeShippingLimit),
        announcement
      },
      create: {
        id: "default",
        shippingFee: parseFloat(shippingFee),
        freeShippingLimit: parseFloat(freeShippingLimit),
        announcement
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
