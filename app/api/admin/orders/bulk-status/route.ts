// app/api/admin/orders/bulk-status/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest) {
  // 🔒 Admin only
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const { orderIds, status } = await req.json()

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ error: "Missing orderIds array or status" }, { status: 400 })
    }

    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const result = await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status }
    })

    return NextResponse.json({ success: true, updatedCount: result.count })
  } catch (error: any) {
    console.error("Bulk status update failed:", error)
    return NextResponse.json({ error: "Failed to update orders" }, { status: 500 })
  }
}
