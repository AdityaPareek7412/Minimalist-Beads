// pages/api/categories.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/db/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { order: "asc" },
      })

      res.status(200).json(categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      res.status(500).json({ error: "Failed to fetch categories" })
    }
  } else if (req.method === "POST") {
    // Admin only
    try {
      const { name, slug, description, image, icon } = req.body

      const category = await prisma.category.create({
        data: { name, slug, description, image, icon },
      })

      res.status(201).json(category)
    } catch (error) {
      console.error("Error creating category:", error)
      res.status(500).json({ error: "Failed to create category" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
