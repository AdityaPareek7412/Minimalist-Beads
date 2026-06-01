import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findFirst({
    where: { name: { contains: "Cross charm", mode: "insensitive" } }
  });

  if (!p) {
    console.log("Product not found");
    return;
  }

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: { productId: p.id }
      }
    },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      customerName: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(JSON.stringify(orders, null, 2));
}

main().finally(() => prisma.$disconnect());
