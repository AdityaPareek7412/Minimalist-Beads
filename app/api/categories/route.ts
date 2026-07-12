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
  { revalidate: 300, tags: ["categories"] }
)

export async function GET() {
  try {
    const categories = await getCachedCategories()
    const res = NextResponse.json(categories)
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

