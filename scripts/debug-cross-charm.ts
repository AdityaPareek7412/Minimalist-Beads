import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findMany({
    where: { name: { contains: "Cross charm", mode: "insensitive" } },
    include: { variants: true }
  });
  console.log(JSON.stringify(p, null, 2));
}
main().finally(() => prisma.$disconnect());
