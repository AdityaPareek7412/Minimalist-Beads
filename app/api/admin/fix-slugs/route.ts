import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { revalidateTag, revalidatePath } from "next/cache"
import { sanitizeSlug } from "@/app/api/admin/products/route"

// POST /api/admin/fix-slugs
// Scans all products and sanitizes any slugs that contain non-alphanumeric characters
// (curly quotes, apostrophes, emojis, etc.) that break Next.js URL routing.
export async function POST(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, slug: true },
    })

    const broken = products.filter((p) => /[^a-z0-9\-]/.test(p.slug))

    if (broken.length === 0) {
      return NextResponse.json({ fixed: 0, message: "All slugs are clean ✅" })
    }

    // Update broken slugs one by one to avoid collision on unique constraint
    const updates: { id: string; oldSlug: string; newSlug: string }[] = []

    for (const product of broken) {
      // Generate a clean slug from the product name
      const newSlug = sanitizeSlug(product.name)

      await prisma.product.update({
        where: { id: product.id },
        data: { slug: newSlug },
      })

      updates.push({ id: product.id, oldSlug: product.slug, newSlug })
    }

    // Bust all caches so shop & homepage pick up new slugs immediately
    revalidateTag("products")
    revalidatePath("/", "layout")

    return NextResponse.json({
      fixed: updates.length,
      message: `Fixed ${updates.length} product slug(s) ✅`,
      details: updates,
    })
  } catch (error: any) {
    console.error("fix-slugs error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
