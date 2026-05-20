import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const dynamic = "force-dynamic"

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
    return NextResponse.json(categories)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
