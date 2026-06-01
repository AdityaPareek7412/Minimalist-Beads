import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findUnique({ where: { id: "cmpglpf0h01vhtwnu1993gftf" } });
  console.log("Product:", p?.name, "Stock:", p?.stock);
}

main().finally(() => prisma.$disconnect());
