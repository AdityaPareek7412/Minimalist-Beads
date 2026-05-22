import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: "charm",
        mode: "insensitive"
      }
    }
  })
  console.log("Found charms:", JSON.stringify(products, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
