// app/api/send-missed/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendOrderConfirmationEmail } from "@/lib/mail"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const orderIds = [
      "cmplb8u220004d2uxal87dgc4", // Sangeeta's order ID
      "cmplcpr37000gd2uxy5g3rdaa"  // Ankit's order ID
    ]

    const results = []

    for (const id of orderIds) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: { include: { images: true } } }
          },
          shippingAddress: true,
          payment: true,
        }
      })

      if (order) {
        const sendResult = await sendOrderConfirmationEmail(order)
        results.push({ orderId: id, email: order.customerEmail, sendResult })
      } else {
        results.push({ orderId: id, error: "Order not found" })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Missed emails trigger complete.",
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || error
    }, { status: 500 })
  }
}
