import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

const baseUrl = 'https://www.minimalistbeads.in'

// Cache sitemap data for 10 minutes — bots crawl this repeatedly
// Tagged with "products" and "categories" so it auto-busts when admin updates either
const getCachedSitemapData = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      select: { slug: true, updatedAt: true }
    })
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true }
    })
    return { products, categories }
  },
  ["sitemap-data"],
  { revalidate: 600, tags: ["products", "categories"] }
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { products, categories } = await getCachedSitemapData()

    const productUrls = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const categoryUrls = categories.map((c) => ({
      url: `${baseUrl}/shop?category=${c.slug}`,
      lastModified: c.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const staticUrls = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
      { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
      { url: `${baseUrl}/wishlist`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
      { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
      { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
      { url: `${baseUrl}/shipping-policy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
      { url: `${baseUrl}/refund-policy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
      { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
      { url: `${baseUrl}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    ]

    return [...staticUrls, ...categoryUrls, ...productUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
      { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    ]
  }
}
