import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  // 🔒 Admin only
  const authError = requireAdmin(req)
  if (authError) return authError

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
  // 🔒 Admin only
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const data = await req.json()
    const { code, discountType, discountValue, minOrderValue, validFrom, validUntil } = data

    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const startStr = validFrom.split('T')[0]
    const endStr = validUntil.split('T')[0]

    const startDate = new Date(`${startStr}T00:00:00+05:30`)
    const endDate = new Date(`${endStr}T23:59:59.999+05:30`)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || 0),
        validFrom: startDate,
        validUntil: endDate,
        active: true
      }
    })

    return NextResponse.json(coupon)
  } catch (error: any) {
    console.error("Coupon creation error:", error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  // 🔒 Admin only
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing coupon ID" }, { status: 400 })
    }

    await prisma.coupon.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" })
  } catch (error: any) {
    console.error("Coupon deletion error:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
