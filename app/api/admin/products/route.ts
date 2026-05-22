import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"
import { unstable_cache, revalidateTag } from "next/cache"

export const dynamic = "force-dynamic"

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

    const products = await getCachedProducts()
    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
          folder: "minimalist_beads_products",
        })
        return {
          url: uploadResponse.secure_url,
          alt: name,
          order: index,
        }
      })
    )

    // 2. Create slug
    const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Date.now()

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

    return NextResponse.json(product)
  } catch (error: any) {
    console.error("Product creation failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    await prisma.product.delete({
      where: { id },
    })

    // Trigger cache revalidation
    revalidateTag("products")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json()
    const { id, stock, variants } = data

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

      return tx.product.update({
        where: { id },
        data: { stock: parseInt(stock) || 0 },
        include: {
          variants: true
        }
      })
    })

    // Trigger cache revalidation
    revalidateTag("products")

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
