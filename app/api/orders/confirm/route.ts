// app/api/orders/confirm/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendOrderConfirmationEmail } from "@/lib/mail"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, paymentId, razorpaySignature, dbOrderId } = await req.json()

    if (!razorpayOrderId || !paymentId || !razorpaySignature || !dbOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing verification parameters" },
        { status: 400 }
      )
    }

    // Verify signature
    const body = razorpayOrderId + "|" + paymentId
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    // Perform database confirmation
    const order = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: {
        items: true,
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Idempotent check: If already confirmed, return success immediately
    if (order.status !== "PENDING") {
      return NextResponse.json({
        success: true,
        message: "Order already confirmed",
        orderId: order.id,
      })
    }

    // Run transaction to update order status and decrement stock
    const confirmedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update Order status
      const updatedOrder = await tx.order.update({
        where: { id: dbOrderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "COMPLETED",
        },
      })

      // 2. Update Payment details
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            paymentId: paymentId,
            status: "COMPLETED",
          },
        })
      }

      // 3. Decrement stock for each item in the order
      for (const item of order.items) {
        if (item.selectedVariantId) {
          await tx.productVariant.update({
            where: { id: item.selectedVariantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }

        // Increment sold count for the main product in both cases
        await tx.product.update({
          where: { id: item.productId },
          data: {
            sold: {
              increment: item.quantity,
            },
          },
        })
      }

      // 4. Update coupon usage if applicable
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        })
      }

      return updatedOrder
    })

    // Fetch the full order with relations for the confirmation email
    const fullOrder = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: {
        items: {
          include: { product: { include: { images: true } } }
        },
        shippingAddress: true,
        payment: true,
      }
    })

    if (fullOrder) {
      sendOrderConfirmationEmail(fullOrder).catch(err => {
        console.error("Failed to send order confirmation email:", err)
      })
    }

    return NextResponse.json({
      success: true,
      message: "Order confirmed successfully",
      order: confirmedOrder,
    })
  } catch (error: any) {
    console.error("Order confirmation failed:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Order confirmation failed" },
      { status: 500 }
    )
  }
}
