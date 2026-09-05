import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { unstable_cache, revalidateTag } from "next/cache"

// Cache settings for 10 minutes server-side (barely ever changes)
const getCachedSettings = unstable_cache(
  async () => {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" }
    })
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "default", shippingFee: 80, freeShippingLimit: 0 }
      })
    }
    return settings
  },
  ["site-settings"],
  { revalidate: 600, tags: ["settings"] }
)

// GET is public — needed by Header, WhyChooseUs, Cart, Checkout for shipping fees & announcement
export async function GET() {
  try {
    const settings = await getCachedSettings()
    const res = NextResponse.json(settings)
    // CDN caches for 5 min — eliminates repeated Lambda hits per user session
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return res
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

    // Bust settings cache so next request picks up the new values
    revalidateTag("settings")

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
