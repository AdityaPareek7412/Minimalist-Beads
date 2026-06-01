import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.orderItem.findMany({
    select: {
      quantity: true,
      product: { select: { name: true } }
    }
  });

  const counts: Record<string, number> = {};
  for (const item of items) {
    const name = item.product?.name || "DELETED PRODUCT";
    counts[name] = (counts[name] || 0) + item.quantity;
  }

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log("Top products:");
  top.forEach(([name, count]) => console.log(`${count}x ${name}`));
}

main().finally(() => prisma.$disconnect());
