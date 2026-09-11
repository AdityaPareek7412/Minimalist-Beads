// app/api/orders/confirm/route.ts
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { confirmOrderAndAssignMbNumber } from "@/lib/order-confirmation"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let paymentId = ""
  let dbOrderId = ""
  let razorpayOrderId = ""

  try {
    const body = await req.json()
    paymentId = body.paymentId || ""
    dbOrderId = body.dbOrderId || ""
    razorpayOrderId = body.razorpayOrderId || ""
    const razorpaySignature = body.razorpaySignature || ""

    if (!razorpayOrderId || !paymentId || !razorpaySignature || !dbOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing verification parameters" },
        { status: 400 }
      )
    }

    // Verify signature FIRST — before any DB operations
    const signatureBody = razorpayOrderId + "|" + paymentId
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(signatureBody.toString())
      .digest("hex")

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    // Execute atomic, concurrency-safe, idempotent confirmation
    const confirmation = await confirmOrderAndAssignMbNumber({
      dbOrderId,
      paymentId,
      razorpayOrderId,
    })

    if (!confirmation.success) {
      return NextResponse.json(
        {
          success: false,
          error: confirmation.error || "Order confirmation failed",
          paymentRef: paymentId || undefined,
          code: "DB_CONFIRM_FAILED",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: confirmation.alreadyConfirmed
        ? "Order already confirmed"
        : "Order confirmed successfully",
      orderNumber: confirmation.orderNumber,
      order: confirmation.order,
    })
  } catch (error: any) {
    console.error("=== CRITICAL ORDER CONFIRMATION FAILURE ===")
    console.error(`Razorpay Payment ID : ${paymentId}`)
    console.error(`Razorpay Order ID   : ${razorpayOrderId}`)
    console.error(`DB Order ID         : ${dbOrderId}`)
    console.error(`Error               : ${error.message}`)
    console.error(`Time                : ${new Date().toISOString()}`)
    console.error("===========================================")

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Order confirmation failed",
        paymentRef: paymentId || undefined,
        code: "DB_CONFIRM_FAILED",
      },
      { status: 500 }
    )
  }
}
