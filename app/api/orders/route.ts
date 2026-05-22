import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Basic input validation
    if (!data.cart || !Array.isArray(data.cart) || data.cart.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 })
    }
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // 🔒 Fix 5: Fetch prices from DB — never trust client-sent prices
    const productIds = data.cart.map((item: any) => item.product?.id).filter(Boolean)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true }
    })
    const productMap = new Map(dbProducts.map(p => [p.id, p]))

    // Build verified order items using DB prices
    let serverSubtotal = 0
    const orderItems: {
      productId: string
      quantity: number
      price: number
      total: number
      selectedVariantId: string | null
      selectedVariantName: string | null
    }[] = []

    for (const item of data.cart) {
      const dbProduct = productMap.get(item.product?.id)
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.product?.id}` },
          { status: 400 }
        )
      }

      // Use variant price from DB if variant selected
      let unitPrice: number = dbProduct.price
      let selectedVariantId: string | null = null
      let selectedVariantName: string | null = null

      if (item.selectedVariant?.id) {
        const dbVariant = dbProduct.variants.find(v => v.id === item.selectedVariant.id)
        if (dbVariant) {
          unitPrice = dbVariant.price ?? dbProduct.price
          selectedVariantId = dbVariant.id
          selectedVariantName = dbVariant.name
        }
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1)
      const lineTotal = unitPrice * qty
      serverSubtotal += lineTotal

      orderItems.push({
        productId: dbProduct.id,
        quantity: qty,
        price: unitPrice,        // ✅ DB price
        total: lineTotal,        // ✅ DB price × qty
        selectedVariantId,
        selectedVariantName,
      })
    }

    // Fetch server-side shipping settings
    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: "default" } })
    const shippingFee = siteSettings?.shippingFee ?? 80
    const freeShippingLimit = siteSettings?.freeShippingLimit ?? 500
    const serverShippingCost = serverSubtotal >= freeShippingLimit ? 0 : shippingFee

    // Apply coupon discount if present (validate server-side)
    let serverDiscount = 0
    let validCouponId: string | null = null

    if (data.couponId) {
      const coupon = await prisma.coupon.findUnique({ where: { id: data.couponId } })
      const now = new Date()
      if (
        coupon &&
        coupon.active &&
        coupon.validFrom <= now &&
        coupon.validUntil >= now &&
        serverSubtotal >= (coupon.minOrderValue ?? 0)
      ) {
        if (coupon.discountType === "PERCENTAGE") {
          serverDiscount = Math.round((serverSubtotal * coupon.discountValue) / 100)
        } else {
          serverDiscount = Math.min(coupon.discountValue, serverSubtotal)
        }
        validCouponId = coupon.id
      }
    }

    const serverTotal = serverSubtotal + serverShippingCost - serverDiscount

    // 🔒 Sanity check: server total must be > 0
    if (serverTotal <= 0) {
      return NextResponse.json({ success: false, error: "Invalid order total" }, { status: 400 })
    }

    // Create guest address
    const address = await prisma.address.create({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: `${data.countryCode || "+91"}${data.phone}`,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: "India",
      }
    })

    const isCod = data.paymentMethod === "cod"

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the order with SERVER-COMPUTED prices
      const order = await tx.order.create({
        data: {
          shippingAddressId: address.id,
          subtotal: serverSubtotal,
          shippingCost: serverShippingCost,
          discount: serverDiscount,
          couponId: validCouponId,
          total: serverTotal,
          customerName: `${data.firstName} ${data.lastName}`,
          customerEmail: data.email,
          customerPhone: `${data.countryCode || "+91"}${data.phone}`,
          status: isCod ? "CONFIRMED" : "PENDING",
          paymentStatus: "PENDING",
          items: { create: orderItems },
          payment: {
            create: {
              amount: serverTotal,
              paymentMethod: isCod ? "COD" : "RAZORPAY",
              paymentId: null,
              status: "PENDING",
            }
          }
        },
        include: { items: true, shippingAddress: true }
      })

      // 2. For COD only: decrement stock and update coupon immediately
      if (isCod) {
        for (const item of orderItems) {
          if (item.selectedVariantId) {
            await tx.productVariant.update({
              where: { id: item.selectedVariantId },
              data: { stock: { decrement: item.quantity } }
            })
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } }
            })
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { sold: { increment: item.quantity } }
          })
        }

        if (validCouponId) {
          await tx.coupon.update({
            where: { id: validCouponId },
            data: { usedCount: { increment: 1 } }
          })
        }
      }

      return order
    })

    return NextResponse.json({
      success: true,
      order: result,
      // Return server-computed total so client can use it for Razorpay
      serverTotal,
    })
  } catch (error: any) {
    console.error("Failed to save order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save order" },
      { status: 500 }
    )
  }
}
