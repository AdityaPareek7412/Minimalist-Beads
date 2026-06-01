import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: "guitar", mode: "insensitive" } },
    include: { variants: true }
  });

  if (!product) {
    console.log("No product found matching 'guitar'.");
    return;
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: product.id },
    include: {
      order: {
        select: { orderNumber: true, status: true, paymentStatus: true, createdAt: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log("Product Name:", product.name);
  console.log("Current Stock:", product.stock);
  console.log("Sold Count (from DB field):", product.sold);
  
  if (product.variants && product.variants.length > 0) {
    console.log("Variants:", product.variants.map((v: any) => `${v.name} (Stock: ${v.stock})`));
  }

  let totalOrdered = 0;
  let totalConfirmedAndPaid = 0;
  let totalPending = 0;

  console.log("\n--- Order History ---");
  orderItems.forEach((item: any) => {
    const status = item.order.status;
    const qty = item.quantity;
    totalOrdered += qty;
    
    if (status === "PENDING" || status === "CANCELLED") {
      totalPending += qty;
    } else {
      totalConfirmedAndPaid += qty;
    }

    console.log(`- Order ${item.order.orderNumber} | Qty: ${qty} | Status: ${status} | Date: ${item.order.createdAt}`);
  });

  console.log("\n--- Summary ---");
  console.log("Total units ever added to any cart/order:", totalOrdered);
  console.log("Total units from CONFIRMED/PAID/SHIPPED orders:", totalConfirmedAndPaid);
  console.log("Total units stuck in PENDING/CANCELLED (abandoned carts):", totalPending);
  
  // Estimate initial stock
  const estimatedInitial = product.stock + totalConfirmedAndPaid;
  console.log("Estimated Starting Stock (Current Stock + Paid Units):", estimatedInitial);

}

main().finally(() => prisma.$disconnect());
