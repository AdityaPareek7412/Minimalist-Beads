// pages/api/orders/index.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/db/prisma"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { userId, items, shippingAddress, paymentMethod, couponCode } = req.body

      // Calculate totals
      let subtotal = 0
      const orderItems = []

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) return res.status(404).json({ error: "Product not found" })

        const itemTotal = product.price * item.quantity
        subtotal += itemTotal

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        })
      }

      const shipping = subtotal > 500 ? 0 : 50
      const tax = subtotal * 0.18
      let discount = 0

      // Apply coupon if provided
      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode },
        })

        if (coupon && coupon.active && new Date() < coupon.validUntil) {
          if (coupon.discountType === "percentage") {
            discount = (subtotal * coupon.discountValue) / 100
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
          } else {
            discount = coupon.discountValue
          }
        }
      }

      const total = subtotal + tax + shipping - discount

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          subtotal,
          shippingCost: shipping,
          tax,
          discount,
          total,
          items: { create: orderItems },
          shippingAddressId: shippingAddress?.id,
          status: "PENDING",
          paymentStatus: paymentMethod === "cod" ? "PENDING" : "PENDING",
        },
        include: { items: true },
      })

      // Create Razorpay order if payment method is online
      if (paymentMethod === "razorpay" || paymentMethod === "upi") {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: order.id,
          notes: {
            orderId: order.id,
            userId,
          },
        })

        await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: total,
            currency: "INR",
            paymentMethod: "RAZORPAY",
            paymentId: razorpayOrder.id,
          },
        })

        return res.status(201).json({
          order,
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
          },
        })
      }

      // COD order
      res.status(201).json({ order })
    } catch (error) {
      console.error("Error creating order:", error)
      res.status(500).json({ error: "Failed to create order" })
    }
  } else if (req.method === "GET") {
    try {
      const { userId } = req.query

      const orders = await prisma.order.findMany({
        where: { userId: userId as string },
        include: { items: { include: { product: true } }, payment: true },
        orderBy: { createdAt: "desc" },
      })

      res.status(200).json(orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      res.status(500).json({ error: "Failed to fetch orders" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
