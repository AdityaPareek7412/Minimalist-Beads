import { HeroSection } from "@/components/sections/HeroSection"
import { FeaturedProducts } from "@/components/sections/FeaturedProducts"
import { CategoriesSection } from "@/components/sections/CategoriesSection"
import { WhyChooseUs } from "@/components/sections/WhyChooseUs"
import { NewsletterSection } from "@/components/sections/NewsletterSection"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    include: { images: true },
    take: 8
  })

  const categories = await prisma.category.findMany()

  // Map categories to match the expected UI structure
  const formattedCategories = categories.map((cat, index) => ({
    ...cat,
    image: "https://images.unsplash.com/photo-1599643478702-ccff6cb355ef?w=300&h=300&fit=crop", // Fallback images
    icon: ["🖤", "🌸", "✨", "💎", "⭐"][index % 5],
  }))

  return (
    <>
      <HeroSection />
      <FeaturedProducts
        products={JSON.parse(JSON.stringify(featuredProducts))}
        title="Featured Collection"
        description="Handpicked pieces for your aesthetic"
      />
      <CategoriesSection categories={JSON.parse(JSON.stringify(formattedCategories))} />
      <WhyChooseUs />
      <NewsletterSection />
    </>
  )
}
