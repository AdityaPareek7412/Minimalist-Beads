import { HeroSection } from "@/components/sections/HeroSection"
import { FeaturedProducts } from "@/components/sections/FeaturedProducts"
import { AestheticStory } from "@/components/sections/AestheticStory"
import { WhyChooseUs } from "@/components/sections/WhyChooseUs"
import { ReviewsSection } from "@/components/sections/ReviewsSection"
import { NewsletterSection } from "@/components/sections/NewsletterSection"
import prisma from "@/lib/prisma"
// Statically generated page, revalidated on-demand when products/reviews change
export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    include: { images: true },
    orderBy: [
      { displayOrder: "asc" },
      { createdAt: "desc" }
    ],
    take: 8
  })

  return (
    <>
      <HeroSection />
      <FeaturedProducts
        products={JSON.parse(JSON.stringify(featuredProducts))}
        title="Featured Collection"
        description="Handpicked pieces for your aesthetic"
      />
      <AestheticStory />
      <WhyChooseUs />
      <ReviewsSection />
      <NewsletterSection />
    </>
  )
}
