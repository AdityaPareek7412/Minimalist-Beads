import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

// Note: NOT force-dynamic — CDN caching enabled for public categories list

// Cache categories for 300 seconds (5 minutes)
const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { order: "asc" }
    })
  },
  ["categories-list"],
  { revalidate: 86400, tags: ["categories"] }
)

export async function GET() {
  try {
    const categories = await getCachedCategories()
    const res = NextResponse.json(categories)
    res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400')
    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

