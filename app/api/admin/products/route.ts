import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"

// Proper slug sanitization — removes curly quotes, apostrophes, emojis, and ALL
// non-alphanumeric characters that break Next.js URL routing.
export function sanitizeSlug(name: string): string {
  return name
    .normalize('NFD')                    // Decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')    // Strip diacritical marks
    .replace(/[\u2018\u2019\u201A\u201B]/g, '') // Strip curly single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '') // Strip curly double quotes
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')       // Remove ALL remaining special chars
    .trim()                              // Remove leading/trailing whitespace
    .replace(/\s+/g, '-')               // Spaces → hyphens
    .replace(/-+/g, '-')                // Collapse consecutive hyphens
    .replace(/^-|-$/g, '')              // Trim leading/trailing hyphens
    + '-' + Date.now()
}

// Note: NOT force-dynamic — we want CDN caching for public product listings
// Admin routes still get fresh data via direct Prisma calls

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Cache the products list for 60 seconds, with tag "products"
const getCachedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        stock: true,
        featured: true,
        trending: true,
        newArrival: true,
        displayOrder: true,
        categoryId: true,
        createdAt: true,
        images: {
          select: {
            url: true,
            alt: true,
            order: true,
          },
          orderBy: {
            order: "asc"
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" }
      ],
    })
  },
  ["admin-products-list"],
  { revalidate: 60, tags: ["products"] }
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          category: true,
          variants: true,
        },
      })
      return NextResponse.json(product)
    }

    // Check if requester is logged in as admin
    const isAdmin = requireAdmin(req) === null

    if (isAdmin) {
      // Admin gets all products directly from DB (including archived ones)
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          stock: true,
          featured: true,
          trending: true,
          newArrival: true,
          displayOrder: true,
          categoryId: true,
          isArchived: true,
          createdAt: true,
          images: {
            select: {
              url: true,
              alt: true,
              order: true,
            },
            orderBy: {
              order: "asc"
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" }
        ],
      })
      return NextResponse.json(products)
    }

    // Public users get cached non-archived products
    // Cache at Vercel CDN for 5 min — dramatically reduces Supabase egress
    const products = await getCachedProducts()
    const res = NextResponse.json(products)
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError
  try {
    const data = await req.json()
    const { productIds } = data

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: "Missing productIds array" }, { status: 400 })
    }

    // Bulk update the displayOrder of products in a transaction
    await prisma.$transaction(
      productIds.map((id, index) =>
        prisma.product.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    )

    // Trigger cache revalidation
    revalidateTag("products")
    revalidatePath("/", "layout")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError
  try {
    const data = await req.json()
    const { name, price, description, categoryId, imagesBase64, featured, stock, variants } = data

    if (!name || !price || !categoryId || !imagesBase64 || !Array.isArray(imagesBase64)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Upload all to Cloudinary
    const uploadedImages = await Promise.all(
      imagesBase64.map(async (base64, index) => {
        const uploadResponse = await cloudinary.uploader.upload(base64, {
          folder: "minimalist-beads-v2",
        })
        return {
          url: uploadResponse.secure_url,
          alt: name,
          order: index,
        }
      })
    )

    // 2. Create slug (sanitized — removes curly quotes, emojis, special chars)
    const slug = sanitizeSlug(name)

    // 3. Save to DB
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        price: parseFloat(price),
        description,
        categoryId,
        stock: parseInt(stock) || 0,
        featured: featured || false,
        images: {
          create: uploadedImages
        },
        variants: variants && Array.isArray(variants) ? {
          create: variants.map((v: any) => ({
            name: v.name,
            price: v.price ? parseFloat(v.price) : null,
            stock: parseInt(v.stock) || 0,
          }))
        } : undefined
      },
      include: {
        images: true,
        variants: true
      }
    })

    // Trigger cache revalidation
    revalidateTag("products")
    revalidatePath("/", "layout")

    return NextResponse.json(product)
  } catch (error: any) {
    console.error("Product creation failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    // Check if the product has associated order items
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderItemsCount > 0) {
      // Soft-delete by setting isArchived to true
      await prisma.product.update({
        where: { id },
        data: { isArchived: true }
      })

      // Trigger cache revalidation
      revalidateTag("products")
      revalidatePath("/", "layout")

      return NextResponse.json({ success: true, archived: true })
    }

    // Permanent delete
    await prisma.product.delete({
      where: { id },
    })

    // Trigger cache revalidation
    revalidateTag("products")
    revalidatePath("/", "layout")

    return NextResponse.json({ success: true, archived: false })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const authError = requireAdmin(req)
  if (authError) return authError
  try {
    const data = await req.json()
    const { id, stock, price, originalPrice, variants, isArchived } = data

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    const product = await prisma.$transaction(async (tx) => {
      if (variants && Array.isArray(variants)) {
        // Delete all old variants and insert new ones
        await tx.productVariant.deleteMany({
          where: { productId: id }
        })
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v: any) => ({
              productId: id,
              name: v.name,
              price: v.price ? parseFloat(v.price) : null,
              stock: parseInt(v.stock) || 0,
            }))
          })
        }
      }

      const updateData: any = {
        stock: parseInt(stock) || 0
      }

      if (typeof price !== "undefined") {
        updateData.price = parseFloat(price) || 0
      }

      if (typeof originalPrice !== "undefined") {
        updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null
      }

      if (typeof isArchived !== "undefined") {
        updateData.isArchived = !!isArchived
      }

      return tx.product.update({
        where: { id },
        data: updateData,
        include: {
          variants: true
        }
      })
    })

    // Trigger cache revalidation
    revalidateTag("products")
    revalidatePath("/", "layout")

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
