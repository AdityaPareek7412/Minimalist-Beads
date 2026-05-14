import { PrismaClient } from "@prisma/client"
import { mockProducts } from "../src/data/products"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting migration...")

  // 1. Create Categories first
  const categories = [
    { id: "1", name: "Resin Art", slug: "resin-art" },
    { id: "2", name: "Aesthetic Rings", slug: "aesthetic-rings" },
    { id: "3", name: "Handmade Charms", slug: "handmade-charms" },
    { id: "4", name: "Limited Drops", slug: "limited-drops" },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }
  console.log("Categories created.")

  // 2. Create Products
  console.log(`Migrating ${mockProducts.length} products...`)
  
  for (const p of mockProducts) {
    try {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
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

  console.log("Migration finished successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
