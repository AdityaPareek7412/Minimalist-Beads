import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
        country: "India", // Assuming mostly India for now
      }
    })

    // Prepare order items
    const orderItems = data.cart.map((item: any) => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      total: item.product.price * item.quantity,
    }))

    // Create the order
    const order = await prisma.order.create({
      data: {
        shippingAddressId: address.id,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        total: data.totalAmount,
        customerName: `${data.firstName} ${data.lastName}`,
        customerEmail: data.email,
        customerPhone: `${data.countryCode}${data.phone}`,
        status: "PENDING",
        paymentStatus: data.paymentMethod === "cod" ? "PENDING" : "COMPLETED",
        items: {
          create: orderItems
        },
        payment: {
          create: {
            amount: data.totalAmount,
            paymentMethod: data.paymentMethod === "cod" ? "COD" : "RAZORPAY",
            paymentId: data.paymentId || null,
            status: data.paymentMethod === "cod" ? "PENDING" : "COMPLETED",
          }
        }
      },
      include: {
        items: true,
        shippingAddress: true,
      }
    })

    return NextResponse.json({ success: true, order })
  } catch (error: any) {
    console.error("Failed to save order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save order" },
      { status: 500 }
    )
  }
}
