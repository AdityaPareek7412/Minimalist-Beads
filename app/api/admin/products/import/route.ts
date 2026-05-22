import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"
import { revalidateTag } from "next/cache"

export const dynamic = "force-dynamic"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { products } = data

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "Missing products array" }, { status: 400 })
    }

    const importedProducts = []
    const errors = []

    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      const { name, price, stock, description, category: categoryName, image } = p

      if (!name || price === undefined) {
        errors.push({ row: i + 1, error: "Name and Price are required" })
        continue
      }

      try {
        // 1. Resolve Category
        const cleanCategoryName = (categoryName || "Uncategorized").trim()
        let categorySlug = cleanCategoryName
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^a-z0-9-]/g, "")
        
        if (!categorySlug) categorySlug = "uncategorized"

        let category = await prisma.category.findFirst({
          where: {
            OR: [
              { name: { equals: cleanCategoryName, mode: "insensitive" } },
              { slug: { equals: categorySlug, mode: "insensitive" } }
            ]
          }
        })

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: cleanCategoryName,
              slug: categorySlug,
              icon: "✨"
            }
          })
        }

        // 2. Upload Image to Cloudinary (if URL provided)
        let finalImageUrl = "/placeholder.jpg"
        if (image && typeof image === "string" && image.startsWith("http")) {
          // Auto-fix legacy image URLs on-the-fly before uploading
          const cleanImageUrl = image
            .replace(/dm2buy-resize-dynamic-cebdcaefgydgh6hu\.z02\.azurefd\.net\/dm2buy/g, "dm2buy-aqbqh9cwb5cwb9he.z02.azurefd.net/dm2buy")
            .replace(/s3\.ap-south-1\.amazonaws\.com\/dm2buy/g, "dm2buy-aqbqh9cwb5cwb9he.z02.azurefd.net/dm2buy")

          try {
            const uploadResponse = await cloudinary.uploader.upload(cleanImageUrl, {
              folder: "minimalist_beads_products",
            })
            finalImageUrl = uploadResponse.secure_url
          } catch (uploadErr) {
            console.error("Cloudinary upload failed for URL:", cleanImageUrl, uploadErr)
            // Fallback to corrected external URL if Cloudinary upload fails
            finalImageUrl = cleanImageUrl
          }
        } else if (image && typeof image === "string") {
          // If it is base64 or already an uploaded URL
          finalImageUrl = image
        }

        // 3. Create Product Slug
        let baseSlug = name
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^a-z0-9-]/g, "")
        
        if (!baseSlug) baseSlug = "product"

        let uniqueSlug = baseSlug
        let count = 1
        while (true) {
          const existing = await prisma.product.findUnique({
            where: { slug: uniqueSlug }
          })
          if (!existing) break
          uniqueSlug = `${baseSlug}-${count}-${Math.floor(Math.random() * 1000)}`
          count++
        }

        // 4. Create Product in DB
        const createdProduct = await prisma.product.create({
          data: {
            name: name.trim(),
            slug: uniqueSlug,
            price: parseFloat(price) || 0,
            description: description || "",
            stock: parseInt(stock) || 0,
            categoryId: category.id,
            images: {
              create: [
                {
                  url: finalImageUrl,
                  alt: name,
                  order: 0
                }
              ]
            }
          },
          include: {
            images: true,
            category: true
          }
        })

        importedProducts.push(createdProduct)
      } catch (productErr: any) {
        console.error(`Failed to import product row ${i + 1}:`, productErr)
        errors.push({ row: i + 1, name, error: productErr.message })
      }
    }

    // Trigger cache revalidation
    revalidateTag("products")

    return NextResponse.json({
      success: true,
      importedCount: importedProducts.length,
      importedProducts,
      errors
    })
  } catch (error: any) {
    console.error("Bulk import failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
