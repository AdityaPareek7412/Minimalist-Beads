// pages/api/payment/verify.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/db/prisma"
import crypto from "crypto"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: "Signature verification failed" })
    }

    // Find and update payment
    const payment = await prisma.payment.findUnique({
      where: { id: razorpayOrderId },
      include: { order: true },
    })

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    // Update payment and order status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED" },
    })

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: "COMPLETED", status: "CONFIRMED" },
    })

    res.status(200).json({ message: "Payment verified successfully" })
  } catch (error) {
    console.error("Error verifying payment:", error)
    res.status(500).json({ error: "Failed to verify payment" })
  }
}
