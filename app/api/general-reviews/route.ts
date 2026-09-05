// app/api/general-reviews/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

// Cache approved reviews for 5 minutes (reviews require admin approval — staleness is safe)
const getCachedReviews = unstable_cache(
  async () => {
    return (prisma as any).generalReview.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 12
    })
  },
  ["general-reviews-list"],
  { revalidate: 300, tags: ["general-reviews"] }
)

export async function GET() {
  try {
    const reviews = await getCachedReviews()
    const res = NextResponse.json(reviews)
    // CDN caches for 5 min — homepage visits stop hitting Lambda every time
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return res
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, rating, comment } = body

    if (!name || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const review = await (prisma as any).generalReview.create({
      data: {
        name,
        rating: Number(rating),
        comment,
        approved: false // Set to false to require admin approval
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
