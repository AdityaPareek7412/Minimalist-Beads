import { PrismaClient } from "@prisma/client"
import { mockProducts } from "../src/data/products"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting ID-safe migration...")

  // 1. Delete all existing data to start fresh with correct IDs
  console.log("Cleaning up old data...")
  await prisma.orderItem.deleteMany({})
  await prisma.productImage.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})
  console.log("Cleanup done.")

  // 2. Create Categories with fixed IDs
  const categories = [
    { id: "1", name: "Resin Art", slug: "resin-art" },
    { id: "2", name: "Aesthetic Rings", slug: "aesthetic-rings" },
    { id: "3", name: "Handmade Charms", slug: "handmade-charms" },
    { id: "4", name: "Limited Drops", slug: "limited-drops" },
  ]

  for (const cat of categories) {
    await prisma.category.create({
      data: cat,
    })
  }
  console.log("Categories recreated with fixed IDs.")

  // 3. Create Products with fixed IDs
  console.log(`Migrating ${mockProducts.length} products...`)
  
  for (const p of mockProducts) {
    try {
      await prisma.product.create({
        data: {
          id: p.id, // FORCE THE ID TO MATCH MOCK DATA
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          stock: p.stock,
          featured: p.featured,
          trending: p.trending,
          newArrival: p.newArrival,
          categoryId: p.categoryId,
          images: {
            create: p.images.map(img => ({
              url: img.url,
              alt: img.alt,
              order: img.order
            }))
          }
        }
      })
    } catch (err) {
      console.error(`Failed to migrate product: ${p.name}`, err)
    }
  }

  console.log("ID-safe migration finished successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
