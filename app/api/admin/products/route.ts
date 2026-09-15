import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { sanitizeSlug } from "@/lib/utils/slugify"

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
  { revalidate: 86400, tags: ["products"] }
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { order: "asc" }
          },
          category: true,
          variants: true,
        },
      })
      const res = NextResponse.json(product)
      res.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate')
      return res
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
      const res = NextResponse.json(products)
      res.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate')
      return res
    }

    // Public users get cached non-archived products
    // Cached via unstable_cache on server, short edge CDN header so new admin additions show up instantly
    const products = await getCachedProducts()
    const res = NextResponse.json(products)
    res.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=50')
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

    // Trigger cache revalidation — bust product listing cache and ISR cache for all product pages
    revalidateTag("products")
    revalidatePath("/", "layout")
    revalidatePath("/products/[slug]", "page")

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

    // Trigger cache revalidation — new product; bust listing cache
    revalidateTag("products")
    revalidatePath("/", "layout")
    revalidatePath("/products/[slug]", "page")

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

      // Trigger cache revalidation — product archived; bust its ISR page cache
      revalidateTag("products")
      revalidatePath("/", "layout")
      revalidatePath("/products/[slug]", "page")

      return NextResponse.json({ success: true, archived: true })
    }

    // Permanent delete
    await prisma.product.delete({
      where: { id },
    })

    // Trigger cache revalidation — product deleted; bust its ISR page cache
    revalidateTag("products")
    revalidatePath("/", "layout")
    revalidatePath("/products/[slug]", "page")

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
    const { id, name, stock, price, originalPrice, variants, isArchived, images } = data

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    // Process images if provided: upload any new base64/data URLs to Cloudinary
    let processedImages: { url: string; alt?: string; order: number }[] | null = null
    if (images && Array.isArray(images)) {
      processedImages = await Promise.all(
        images.map(async (img: any, index: number) => {
          const rawUrl = typeof img === "string" ? img : img.url || img.base64
          if (rawUrl && (rawUrl.startsWith("data:") || img.base64)) {
            const uploadSource = img.base64 || rawUrl
            const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
              folder: "minimalist-beads-v2",
            })
            return {
              url: uploadResponse.secure_url,
              alt: name || img.alt || "Product image",
              order: index,
            }
          }
          return {
            url: rawUrl,
            alt: name || img.alt || "Product image",
            order: index,
          }
        })
      )
    }

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

      // Update images if provided
      if (processedImages) {
        await tx.productImage.deleteMany({
          where: { productId: id }
        })
        if (processedImages.length > 0) {
          await tx.productImage.createMany({
            data: processedImages.map((img, idx) => ({
              productId: id,
              url: img.url,
              alt: img.alt || name || "Product image",
              order: idx,
            }))
          })
        }
      }

      const updateData: any = {}

      if (typeof name === "string" && name.trim()) {
        updateData.name = name.trim()
      }

      if (typeof stock !== "undefined") {
        updateData.stock = parseInt(stock) || 0
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
          variants: true,
          images: {
            orderBy: { order: "asc" }
          }
        }
      })
    })

    // Trigger cache revalidation — bust listing cache and ISR cache for the updated product page
    revalidateTag("products")
    revalidatePath("/", "layout")
    revalidatePath(`/products/${product.slug}`, "page")

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
