// pages/api/products/index.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/db/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const {
        page = 1,
        limit = 12,
        categories,
        minPrice,
        maxPrice,
        sortBy = "newest",
        search,
      } = req.query

      const pageNum = parseInt(page as string) || 1
      const limitNum = parseInt(limit as string) || 12
      const skip = (pageNum - 1) * limitNum

      // Build filter
      const where: any = {}

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
        ]
      }

      if (categories) {
        const categoryArray = (categories as string).split(",")
        where.category = {
          slug: { in: categoryArray },
        }
      }

      if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) where.price.gte = parseInt(minPrice as string)
        if (maxPrice) where.price.lte = parseInt(maxPrice as string)
      }

      // Build orderBy
      let orderBy: any = { createdAt: "desc" }

      switch (sortBy) {
        case "price-low":
          orderBy = { price: "asc" }
          break
        case "price-high":
          orderBy = { price: "desc" }
          break
        case "trending":
          orderBy = { sold: "desc" }
          break
        case "popular":
          orderBy = [{ sold: "desc" }, { createdAt: "desc" }]
          break
        default:
          orderBy = { createdAt: "desc" }
      }

      // Fetch products
      const products = await prisma.product.findMany({
        where,
        include: { images: true, category: true, reviews: true },
        orderBy,
        skip,
        take: limitNum,
      })

      const total = await prisma.product.count({ where })

      res.status(200).json({
        products,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      })
    } catch (error) {
      console.error("Error fetching products:", error)
      res.status(500).json({ error: "Failed to fetch products" })
    }
  } else if (req.method === "POST") {
    // Admin only
    try {
      const { name, slug, description, price, stock, categoryId, images } = req.body

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          price,
          stock,
          categoryId,
          images: {
            create: images || [],
          },
        },
        include: { images: true },
      })

      res.status(201).json(product)
    } catch (error) {
      console.error("Error creating product:", error)
      res.status(500).json({ error: "Failed to create product" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
