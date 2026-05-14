// pages/api/products/[slug].ts

import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/db/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query

  if (req.method === "GET") {
    try {
      const product = await prisma.product.findUnique({
        where: { slug: slug as string },
        include: { images: true, category: true, reviews: { include: { user: true } } },
      })

      if (!product) {
        return res.status(404).json({ error: "Product not found" })
      }

      res.status(200).json(product)
    } catch (error) {
      console.error("Error fetching product:", error)
      res.status(500).json({ error: "Failed to fetch product" })
    }
  } else if (req.method === "PUT") {
    // Admin only
    try {
      const { name, description, price, stock, categoryId } = req.body

      const product = await prisma.product.update({
        where: { slug: slug as string },
        data: { name, description, price, stock, categoryId },
        include: { images: true },
      })

      res.status(200).json(product)
    } catch (error) {
      console.error("Error updating product:", error)
      res.status(500).json({ error: "Failed to update product" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
