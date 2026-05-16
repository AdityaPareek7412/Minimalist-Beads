const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating collections...");

  const newCollections = [
    { name: "Shop all", slug: "all", order: 1, icon: "🛍️" },
    { name: "Charms", slug: "charms", order: 2, icon: "✨" },
    { name: "Chains", slug: "chains", order: 3, icon: "⛓️" },
    { name: "Beads", slug: "beads", order: 4, icon: "📿" },
    { name: "Rings", slug: "rings", order: 5, icon: "💍" },
    { name: "Keychain Clasp", slug: "keychain-clasp", order: 6, icon: "🔑" },
    { name: "Clearance Sale", slug: "clearance-sale", order: 7, icon: "🏷️" },
  ];

  // 1. Get existing categories to map products if necessary, or just clear them if we're starting fresh
  // Note: Since this is a storefront setup, we might want to keep existing products but move them to new categories.
  // For now, I'll just upsert the categories.

  for (const col of newCollections) {
    await prisma.category.upsert({
      where: { slug: col.slug },
      update: {
        name: col.name,
        order: col.order,
        icon: col.icon,
      },
      create: {
        name: col.name,
        slug: col.slug,
        order: col.order,
        icon: col.icon,
      },
    });
  }

  // Optional: Delete old categories that aren't in the new list
  const activeSlugs = newCollections.map(c => c.slug);
  const oldCategories = await prisma.category.findMany({
    where: {
      NOT: {
        slug: { in: activeSlugs }
      }
    }
  });

  if (oldCategories.length > 0) {
    console.log(`Deleting ${oldCategories.length} old categories...`);
    // Note: This might fail if products are linked. We should move products to 'Shop all' first.
    const shopAll = await prisma.category.findUnique({ where: { slug: 'all' } });
    
    for (const old of oldCategories) {
      await prisma.product.updateMany({
        where: { categoryId: old.id },
        data: { categoryId: shopAll.id }
      });
      await prisma.category.delete({ where: { id: old.id } });
    }
  }

  console.log("Collections updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
