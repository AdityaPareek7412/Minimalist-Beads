"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteAllPendingOrders() {
  try {
    await prisma.order.deleteMany({
      where: { status: "PENDING" }
    })
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete pending orders:", error)
    return { success: false, error: "Failed to delete pending orders" }
  }
}
