import { HeroSection } from "@/components/sections/HeroSection"
import { FeaturedProducts } from "@/components/sections/FeaturedProducts"
import { AestheticStory } from "@/components/sections/AestheticStory"
import { WhyChooseUs } from "@/components/sections/WhyChooseUs"
import { ReviewsSection } from "@/components/sections/ReviewsSection"
import { NewsletterSection } from "@/components/sections/NewsletterSection"
import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

// Statically generated at build time, revalidated on-demand via revalidatePath() from admin panel
export const revalidate = false

// Cache approved reviews for 24h — busts automatically when admin approves/deletes via revalidateTag("general-reviews")
const getCachedReviews = unstable_cache(
  async () => {
    return (prisma as any).generalReview.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    })
  },
  ["homepage-reviews"],
  { revalidate: 86400, tags: ["general-reviews"] }
)

// Cache featured products for 24h — busts automatically on admin product updates via revalidateTag("products")
const getCachedFeaturedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { featured: true },
      include: { images: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" }
      ],
      take: 8
    })
  },
  ["homepage-featured-products"],
  { revalidate: 86400, tags: ["products"] }
)

export default async function Home() {
  // Both fetches are ISR-cached — zero Supabase DB hit per user visit
  const [featuredProducts, reviews] = await Promise.all([
    getCachedFeaturedProducts(),
    getCachedReviews()
  ])

  return (
    <>
      <HeroSection />
      <FeaturedProducts
        products={JSON.parse(JSON.stringify(featuredProducts))}
        title="Featured Collection"
        description="Handpicked pieces for your aesthetic"
      />
      <AestheticStory />
      {/* freeShippingLimit from layout-level server fetch (via getCachedLayoutSettings) */}
      <WhyChooseUs />
      {/* Reviews passed as prop — no client-side DB fetch, egress bachti hai */}
      <ReviewsSection initialReviews={JSON.parse(JSON.stringify(reviews))} />
      <NewsletterSection />
    </>
  )
}
