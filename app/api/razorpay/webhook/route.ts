// app/api/razorpay/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { confirmOrderAndAssignMbNumber } from "@/lib/order-confirmation"

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
      const razorpayOrderId = orderEntity?.id

      if (!dbOrderId || !paymentId) {
        console.warn("Webhook payload missing order receipt or payment ID")
        return NextResponse.json({ success: true, message: "Skipped: missing details" })
      }

      // Execute atomic, concurrency-safe confirmation
      const confirmation = await confirmOrderAndAssignMbNumber({
        dbOrderId,
        paymentId,
        razorpayOrderId,
      })

      if (!confirmation.success) {
        console.error(`Webhook: Order confirmation failed for ${dbOrderId}:`, confirmation.error)
        return NextResponse.json(
          { success: false, error: confirmation.error },
          { status: 500 }
        )
      }

      console.log(
        `Webhook: Successfully confirmed order ${dbOrderId} -> #${confirmation.orderNumber} (alreadyConfirmed: ${confirmation.alreadyConfirmed})`
      )
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
