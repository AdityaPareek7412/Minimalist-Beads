import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const pList = await prisma.product.findMany({ 
    where: { name: { contains: "Cross charm", mode: "insensitive" } },
    select: { id: true, name: true, stock: true }
  });
  console.log("Products found:", pList);
}

main().finally(() => prisma.$disconnect());
