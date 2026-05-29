import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()

    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 })

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "Coupon is no longer active" }, { status: 400 })
    }

    const now = new Date()
    if (now < coupon.validFrom) {
      const startStr = coupon.validFrom.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      return NextResponse.json({ 
        error: `This coupon will be active starting from ${startStr}` 
      }, { status: 400 })
    }
    if (now > coupon.validUntil) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json({ 
        error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` 
      }, { status: 400 })
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else {
      discount = coupon.discountValue
    }

    return NextResponse.json({
      success: true,
      couponId: coupon.id,
      discount: Math.floor(discount),
      code: coupon.code
    })

  } catch (error) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
