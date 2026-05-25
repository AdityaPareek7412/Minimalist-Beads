// app/api/test-email/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendOrderConfirmationEmail } from "@/lib/mail"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY is not defined in Vercel environment variables."
      })
    }

    // Find the latest completed order (Bhavika's order)
    const order = await prisma.order.findFirst({
      where: {
        status: "CONFIRMED"
      },
      include: {
        items: {
          include: { product: { include: { images: true } } }
        },
        shippingAddress: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    if (!order) {
      return NextResponse.json({
        success: false,
        error: "No completed orders found in database to test with."
      })
    }

    // Attempt to send email
    const result = await sendOrderConfirmationEmail(order)

    return NextResponse.json({
      success: true,
      message: "Test execution completed.",
      orderId: order.id,
      customerEmail: order.customerEmail,
      result
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || error
    }, { status: 500 })
  }
}
