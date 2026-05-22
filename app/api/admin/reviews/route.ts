// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  // 🔒 Admin only — review list contains customer data
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const reviews = await (prisma as any).generalReview.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
