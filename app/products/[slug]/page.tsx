import { notFound } from "next/navigation"
import ProductDetailsClient from "./ProductDetailsClient"
import prisma from "@/lib/prisma"

// ISR: Pre-build all known product slugs at deploy time.
// After first visit (or admin revalidation), pages are served from CDN.
// New products added after deploy are still served dynamically (dynamicParams = true).
export const revalidate = false // Only revalidate on-demand via revalidatePath() from admin panel
export const dynamicParams = true // Allow slugs not in generateStaticParams to still render

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    select: { slug: true },
  })
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: true,
      category: true,
      variants: true,
    }
  })

  if (!product) {
    notFound()
  }

  // Get related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: { 
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    include: {
      images: true
    },
    take: 4
  })

  // Serialize dates for client component
  const serializedProduct = JSON.parse(JSON.stringify(product))
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts))

  return (
    <ProductDetailsClient 
      product={serializedProduct} 
      relatedProducts={serializedRelated} 
    />
  )
}
