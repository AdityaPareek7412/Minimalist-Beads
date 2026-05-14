import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import ProductDetailsClient from "./ProductDetailsClient"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: true,
      category: true,
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
