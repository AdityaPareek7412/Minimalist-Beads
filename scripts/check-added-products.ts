import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const products = await prisma.product.findMany({
    where: {
      name: {
        in: [
          "Red heart",
          "Pom Pom charm",
          "key charm",
          "Froggy paw charm ( 1 piece )",
          "huggy wuggy keyring",
          "heart smiley chain keychain",
          "pink flat glass bead bracelet",
          "red heart and green leaf bead keyring"
        ]
      }
    },
    include: {
      images: true,
      category: true
    }
  })
  console.log("Found products in DB:", JSON.stringify(products, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
