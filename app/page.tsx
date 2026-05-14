// app/page.tsx

import { HeroSection } from "@/components/sections/HeroSection"
import { FeaturedProducts } from "@/components/sections/FeaturedProducts"
import { CategoriesSection } from "@/components/sections/CategoriesSection"
import { WhyChooseUs } from "@/components/sections/WhyChooseUs"
import { NewsletterSection } from "@/components/sections/NewsletterSection"
import { mockProducts } from "@/data/products"

const categoryData = [
  {
    id: "1",
    name: "Gothic Charms",
    slug: "gothic-charms",
    description: null,
    image:
      "https://images.unsplash.com/photo-1599643478702-ccff6cb355ef?w=300&h=300&fit=crop",
    icon: "🖤",
    featured: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Cute Charms",
    slug: "cute-charms",
    description: null,
    image:
      "https://images.unsplash.com/photo-1599643478094-f8fb1dd4d86c?w=300&h=300&fit=crop",
    icon: "🌸",
    featured: true,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Resin Art",
    slug: "resin-art",
    description: null,
    image:
      "https://images.unsplash.com/photo-1599643478702-ccff6cb355ef?w=300&h=300&fit=crop",
    icon: "✨",
    featured: true,
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Rings",
    slug: "rings",
    description: null,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop",
    icon: "💎",
    featured: true,
    order: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Pendants",
    slug: "pendants",
    description: null,
    image:
      "https://images.unsplash.com/photo-1599643478094-f8fb1dd4d86c?w=300&h=300&fit=crop",
    icon: "⭐",
    featured: true,
    order: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts
        products={mockProducts}
        title="Featured Collection"
        description="Handpicked pieces for your aesthetic"
      />
      <CategoriesSection categories={categoryData} />
      <WhyChooseUs />
      <NewsletterSection />
    </>
  )
}
