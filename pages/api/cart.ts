// pages/api/cart.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/db/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query

      const cartItems = await prisma.cartItem.findMany({
        where: { userId: userId as string },
        include: { product: { include: { images: true } } },
      })

      res.status(200).json(cartItems)
    } catch (error) {
      console.error("Error fetching cart:", error)
      res.status(500).json({ error: "Failed to fetch cart" })
    }
  } else if (req.method === "POST") {
    try {
      const { userId, productId, quantity } = req.body

      const existingItem = await prisma.cartItem.findUnique({
        where: { userId_productId: { userId, productId } },
      })

      let cartItem

      if (existingItem) {
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { product: true },
        })
      } else {
        cartItem = await prisma.cartItem.create({
          data: { userId, productId, quantity },
          include: { product: true },
        })
      }

      res.status(201).json(cartItem)
    } catch (error) {
      console.error("Error adding to cart:", error)
      res.status(500).json({ error: "Failed to add to cart" })
    }
  } else if (req.method === "DELETE") {
    try {
      const { userId, productId } = req.query

      await prisma.cartItem.delete({
        where: { userId_productId: { userId: userId as string, productId: productId as string } },
      })

      res.status(200).json({ message: "Item removed from cart" })
    } catch (error) {
      console.error("Error removing from cart:", error)
      res.status(500).json({ error: "Failed to remove from cart" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
