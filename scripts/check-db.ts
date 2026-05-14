import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    take: 5,
    select: { id: true, name: true }
  })
  console.log("Current Products in DB:", JSON.stringify(products, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
