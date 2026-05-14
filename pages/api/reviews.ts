// pages/api/reviews.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/db/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { productId } = req.query

      const reviews = await prisma.review.findMany({
        where: { productId: productId as string },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      })

      res.status(200).json(reviews)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      res.status(500).json({ error: "Failed to fetch reviews" })
    }
  } else if (req.method === "POST") {
    try {
      const { productId, userId, rating, title, comment } = req.body

      const review = await prisma.review.create({
        data: {
          productId,
          userId,
          rating,
          title,
          comment,
        },
        include: { user: true },
      })

      res.status(201).json(review)
    } catch (error) {
      console.error("Error creating review:", error)
      res.status(500).json({ error: "Failed to create review" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
