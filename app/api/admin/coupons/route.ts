import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(coupons)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { code, discountType, discountValue, minOrderValue, validUntil } = data

    const expiryDate = new Date(validUntil)
    expiryDate.setHours(23, 59, 59, 999)

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || 0),
        validFrom: new Date(),
        validUntil: expiryDate,
        active: true
      }
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Coupon creation error:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing coupon ID" }, { status: 400 })
    }

    await prisma.coupon.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" })
  } catch (error: any) {
    console.error("Coupon deletion error:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
