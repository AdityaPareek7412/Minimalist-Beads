import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.minimalistbeads.in'

  try {
    // 1. Fetch all active products
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      select: { slug: true, updatedAt: true }
    })

    // 2. Fetch all categories
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true }
    })

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
    // Return static URLs as a fallback in case DB is down
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
      { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    ]
  }
}
