// app/api/razorpay/route.ts

import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

export const dynamic = "force-dynamic"

const MIN_AMOUNT_INR = 1       // ₹1 minimum
const MAX_AMOUNT_INR = 100000  // ₹1,00,000 maximum per order (safety cap)

export async function POST(req: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const { amount, currency = "INR", receipt, notes } = await req.json()

    // 🔒 Server-side amount validation — never trust client
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < MIN_AMOUNT_INR || amountNum > MAX_AMOUNT_INR) {
      return NextResponse.json(
        { success: false, error: `Invalid amount. Must be between ₹${MIN_AMOUNT_INR} and ₹${MAX_AMOUNT_INR}` },
        { status: 400 }
      )
    }

    // Only allow INR
    if (currency !== "INR") {
      return NextResponse.json(
        { success: false, error: "Only INR currency is supported" },
        { status: 400 }
      )
    }

    const options = {
      amount: Math.round(amountNum * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {},
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({ success: true, order })
  } catch (error: any) {
    console.error("Razorpay order creation error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}
