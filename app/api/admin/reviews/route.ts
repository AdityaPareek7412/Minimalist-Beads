// app/api/admin/reviews/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const reviews = await (prisma as any).generalReview.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
