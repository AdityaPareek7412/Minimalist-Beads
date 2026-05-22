import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(req: NextRequest) {
  // 🔒 Admin only
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const { orderId, status, trackingId, trackingUrl } = await req.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        ...(trackingId && { trackingId }),
        ...(trackingUrl && { trackingUrl })
      }
    })

    return NextResponse.json({ success: true, order })
  } catch (error: any) {
    console.error("Failed to update order status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    )
  }
}
