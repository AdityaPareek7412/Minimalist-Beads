import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Marking best products as featured...")
  
  // Mark products containing 'Pendulum' or 'effective' as featured
  const result = await prisma.product.updateMany({
    where: {
      OR: [
        { name: { contains: "Pendulum", mode: "insensitive" } },
        { name: { contains: "effective", mode: "insensitive" } },
        { name: { contains: "premium", mode: "insensitive" } }
      ]
    },
    data: {
      featured: true
    }
  })

  console.log(`Successfully featured ${result.count} products!`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
