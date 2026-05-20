// app/api/razorpay/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing webhook signature" },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured")
      return NextResponse.json(
        { success: false, error: "Webhook secret not configured on server" },
        { status: 500 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex")

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature received")
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      )
    }

    const eventData = JSON.parse(rawBody)
    const event = eventData.event

    // We only process order.paid (or payment.captured as backup) events
    if (event === "order.paid" || event === "payment.captured") {
      const orderEntity = eventData.payload.order?.entity
      const paymentEntity = eventData.payload.payment?.entity

      const dbOrderId = orderEntity?.receipt
      const paymentId = paymentEntity?.id

      if (!dbOrderId || !paymentId) {
        console.warn("Webhook payload missing order receipt or payment ID")
        return NextResponse.json({ success: true, message: "Skipped: missing details" })
      }

      // Fetch the order
      const order = await prisma.order.findUnique({
        where: { id: dbOrderId },
        include: {
          items: true,
          payment: true,
        },
      })

      if (!order) {
        console.warn(`Webhook: Order with ID ${dbOrderId} not found`)
        return NextResponse.json({ success: true, message: "Skipped: order not found" })
      }

      // Idempotent check: If already confirmed, skip
      if (order.status !== "PENDING") {
        return NextResponse.json({
          success: true,
          message: "Order already processed",
        })
      }

      // Confirm order and update stock
      await prisma.$transaction(async (tx) => {
        // 1. Update Order status
        await tx.order.update({
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
      })

      console.log(`Webhook: Successfully confirmed order ${dbOrderId}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook processing failed:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
