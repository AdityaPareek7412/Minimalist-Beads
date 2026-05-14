import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: {
            include: { images: true }
          }
        }
      }
    }
  })
  
  console.log("Recent Orders in DB:")
  orders.forEach(o => {
    console.log(`Order #${o.orderNumber}: Total=${o.total}, Subtotal=${o.subtotal}, Shipping=${o.shippingCost}`)
    o.items.forEach(i => {
      console.log(`  - Item: ${i.product.name}, Images Count: ${i.product.images.length}`)
      if (i.product.images.length > 0) {
        console.log(`    First Image URL: ${i.product.images[0].url}`)
      }
    })
  })
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
