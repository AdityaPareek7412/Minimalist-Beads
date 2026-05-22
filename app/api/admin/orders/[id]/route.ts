import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 🔒 Admin only
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const { id } = params

    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Failed to delete order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    )
  }
}
