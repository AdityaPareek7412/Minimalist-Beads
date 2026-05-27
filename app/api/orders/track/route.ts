import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const number = searchParams.get("number")
    const email = searchParams.get("email")

    if (!number || !email) {
      return NextResponse.json({ error: "Order number and email are required" }, { status: 400 })
    }

    // Try to find by orderNumber or id
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: number.replace("#", "") },
          { id: number }
        ],
        customerEmail: {
          equals: email,
          mode: "insensitive"
        }
      },
      include: {
        items: {
          include: { product: { include: { images: true } } }
        },
        shippingAddress: true,
      }
    })

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
