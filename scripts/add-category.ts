import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Adding 5th category...")
  
  await prisma.category.upsert({
    where: { id: "5" },
    update: {},
    create: {
      id: "5",
      name: "Shop All",
      slug: "all",
    }
  })

  console.log("Category added!")
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
