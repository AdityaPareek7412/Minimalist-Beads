import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const STATIC_REVIEWS = [
    {
      name: "Isha V.",
      comment: "The quality is absolutely insane! I've been wearing my custom charm bracelet every day and it still looks brand new. Best Gen-Z jewelry brand out there! ✨",
      rating: 5,
      approved: true
    },
    {
      name: "Ananya R.",
      comment: "Literally obsessed with the soft gothic vibe. The packaging was so aesthetic, it felt like a luxury gift to myself. 🎀",
      rating: 5,
      approved: true
    }
  ]

  for (const r of STATIC_REVIEWS) {
    const existing = await (prisma as any).generalReview.findFirst({
      where: { name: r.name, comment: r.comment }
    })
    
    if (!existing) {
      await (prisma as any).generalReview.create({
        data: r
      })
      console.log(`Added review from ${r.name}`)
    } else {
      console.log(`Review from ${r.name} already exists.`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
