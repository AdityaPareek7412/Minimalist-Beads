// app/api/general-reviews/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const reviews = await (prisma as any).generalReview.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 12
    })
    return NextResponse.json(reviews)
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
