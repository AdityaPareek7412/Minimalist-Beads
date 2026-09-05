"use server"

import prisma from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"

export async function toggleReviewStatus(id: string, currentStatus: boolean) {
  try {
    await (prisma as any).generalReview.update({
      where: { id },
      data: { approved: !currentStatus }
    })
    revalidateTag("general-reviews") // Bust cached reviews API response
    revalidatePath("/admin/reviews")
    revalidatePath("/") // Revalidate homepage to reflect changes immediately
    return { success: true }
  } catch (error) {
    console.error("Failed to toggle review status:", error)
    return { success: false, error: "Failed to update review" }
  }
}

export async function deleteReview(id: string) {
  try {
    await (prisma as any).generalReview.delete({
      where: { id }
    })
    revalidateTag("general-reviews") // Bust cached reviews API response
    revalidatePath("/admin/reviews")
    revalidatePath("/") // Revalidate homepage to reflect changes immediately
    return { success: true }
  } catch (error) {
    console.error("Failed to delete review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}
