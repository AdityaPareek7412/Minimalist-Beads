import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      customerName: true,
      items: {
        select: {
          product: { select: { name: true } },
          selectedVariantName: true,
          quantity: true
        }
      }
    }
  });

  console.log(JSON.stringify(orders, null, 2));
}

main().finally(() => prisma.$disconnect());
