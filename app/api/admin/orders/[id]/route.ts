import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Delete the order (Prisma will handle cascading deletes if configured, 
    // but we should check if we need to delete OrderItems and Payments manually)
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
