// app/api/general-reviews/[id]/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await (prisma as any).generalReview.delete({
      where: { id }
    })
    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const { approved } = body

    const review = await (prisma as any).generalReview.update({
      where: { id },
      data: { approved }
    })
    return NextResponse.json(review)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}
