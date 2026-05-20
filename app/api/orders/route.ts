import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Create guest address
    const address = await prisma.address.create({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: `${data.countryCode}${data.phone}`,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: "India",
      }
    })

    // Prepare order items
    const orderItems = data.cart.map((item: any) => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      total: item.product.price * item.quantity,
    }))

    const isCod = data.paymentMethod === "cod"

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          shippingAddressId: address.id,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          discount: data.discount || 0,
          couponId: data.couponId || null,
          total: data.totalAmount,
          customerName: `${data.firstName} ${data.lastName}`,
          customerEmail: data.email,
          customerPhone: `${data.countryCode}${data.phone}`,
          status: isCod ? "CONFIRMED" : "PENDING",
          paymentStatus: "PENDING",
          items: {
            create: orderItems
          },
          payment: {
            create: {
              amount: data.totalAmount,
              paymentMethod: isCod ? "COD" : "RAZORPAY",
              paymentId: null,
              status: "PENDING",
            }
          }
        },
        include: {
          items: true,
          shippingAddress: true,
        }
      })

      // Only complete stock decrement and coupon usage immediately for COD orders
      if (isCod) {
        // 2. Decrement stock for each item
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              },
              sold: {
                increment: item.quantity
              }
            }
          })
        }

        // 3. Update coupon usage if applicable
        if (data.couponId) {
          await tx.coupon.update({
            where: { id: data.couponId },
            data: {
              usedCount: {
                increment: 1
              }
            }
          })
        }
      }

      return order
    })

    return NextResponse.json({ success: true, order: result })
  } catch (error: any) {
    console.error("Failed to save order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save order" },
      { status: 500 }
    )
  }
}
