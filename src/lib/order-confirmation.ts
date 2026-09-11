// src/lib/order-confirmation.ts
// Atomic, concurrency-safe, idempotent order confirmation and #MB number allocation helper

import prisma from "@/lib/prisma"
import Razorpay from "razorpay"
import { sendOrderConfirmationEmail, sendOrderCancelledEmail } from "@/lib/mail"

export interface ConfirmOrderParams {
  dbOrderId: string
  paymentId: string
  razorpayOrderId?: string
}

export interface ConfirmOrderResult {
  success: boolean
  alreadyConfirmed: boolean
  hasStockIssue?: boolean
  orderNumber?: string
  order?: any
  error?: string
}

/**
 * Concurrency-safe and idempotent payment confirmation.
 * Guarantees that:
 * 1. Only ONE request can transition an order from PENDING to CONFIRMED.
 * 2. An MB number is assigned atomically from OrderCounter in the SAME transaction.
 * 3. Rollbacks revert the counter increment (no number gaps).
 * 4. Concurrent calls (confirm API + webhook) safely return the already-allocated order.
 */
export async function confirmOrderAndAssignMbNumber({
  dbOrderId,
  paymentId,
  razorpayOrderId,
}: ConfirmOrderParams): Promise<ConfirmOrderResult> {
  try {
    let fullOrderToSendEmail: any = null
    let sendEmailType: "confirmed" | "cancelled" | null = null

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock the order row exclusively with SELECT ... FOR UPDATE
      // This serializes any concurrent confirm API and webhook requests for this specific order.
      const currentOrders = await tx.$queryRaw<
        { id: string; status: string; paymentStatus: string; orderNumber: string }[]
      >`
        SELECT id, status, "paymentStatus", "orderNumber"
        FROM "Order"
        WHERE id = ${dbOrderId}
        FOR UPDATE;
      `

      if (!currentOrders || currentOrders.length === 0) {
        throw new Error(`Order not found: ${dbOrderId}`)
      }

      const currentOrder = currentOrders[0]

      // 2. Concurrency & Idempotency Gate
      // If already confirmed by the other incoming request, exit immediately.
      if (currentOrder.status !== "PENDING" || currentOrder.paymentStatus === "COMPLETED") {
        return {
          alreadyConfirmed: true,
          hasStockIssue: false,
          orderNumber: currentOrder.orderNumber,
        }
      }

      // Fetch order details with relations
      const order = await tx.order.findUnique({
        where: { id: dbOrderId },
        include: {
          items: true,
          payment: true,
        },
      })

      if (!order) {
        throw new Error(`Order details missing: ${dbOrderId}`)
      }

      // 3. Check stock availability for all items
      let hasStockIssue = false
      let stockIssueNotes = ""

      for (const item of order.items) {
        if (item.selectedVariantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.selectedVariantId },
          })
          if (!variant || variant.stock < item.quantity) {
            hasStockIssue = true
            stockIssueNotes = `Stock issue for variant ${item.selectedVariantName || item.selectedVariantId}.`
            break
          }
        } else {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          })
          if (!product || product.stock < item.quantity) {
            hasStockIssue = true
            stockIssueNotes = `Stock issue for product ${item.productId}.`
            break
          }
        }
      }

      // 3.1 Handle Out-Of-Stock scenario
      if (hasStockIssue) {
        let refundNotes = "Refund not initiated."
        try {
          if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            const razorpay = new Razorpay({
              key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
            })
            await razorpay.payments.refund(paymentId, {
              amount: Math.round(Number(order.total) * 100),
              notes: {
                reason: "Item out of stock during payment confirmation.",
                dbOrderId,
              },
            })
            refundNotes = "AUTO-REFUNDED: Amount has been refunded automatically via Razorpay."
          }
        } catch (refundError: any) {
          console.error("Auto-refund failed:", refundError)
          refundNotes = `URGENT: Auto-refund failed. Customer was charged. Please process manual refund on Razorpay. Error: ${refundError.message}`
        }

        const updatedOrder = await tx.order.update({
          where: { id: dbOrderId },
          data: {
            status: "CANCELLED",
            paymentStatus: "COMPLETED",
            notes: `${refundNotes} ${stockIssueNotes}`,
          },
        })

        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              paymentId,
              status: "COMPLETED",
            },
          })
        }

        sendEmailType = "cancelled"
        return {
          alreadyConfirmed: false,
          hasStockIssue: true,
          orderNumber: currentOrder.orderNumber,
          order: updatedOrder,
        }
      }

      // 4. Atomic Counter Increment (Row-locked inside transaction)
      // Rolls back if transaction fails, preventing sequence gaps.
      const counters = await tx.$queryRaw<{ lastNumber: number }[]>`
        UPDATE "OrderCounter"
        SET "lastNumber" = "lastNumber" + 1, "updatedAt" = NOW()
        WHERE id = 'mb_order_number'
        RETURNING "lastNumber";
      `

      let assignedNumber: number
      if (counters && counters.length > 0) {
        assignedNumber = counters[0].lastNumber
      } else {
        // Fallback: initialize counter row if not found
        const countRes = await tx.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM "Order" WHERE "paymentStatus" = 'COMPLETED';
        `
        const baseCount = Number(countRes[0]?.count || 0) + 1
        await tx.$executeRaw`
          INSERT INTO "OrderCounter" ("id", "lastNumber", "updatedAt")
          VALUES ('mb_order_number', ${baseCount}, NOW())
          ON CONFLICT ("id") DO UPDATE
          SET "lastNumber" = "OrderCounter"."lastNumber" + 1, "updatedAt" = NOW();
        `
        const refreshed = await tx.$queryRaw<{ lastNumber: number }[]>`
          SELECT "lastNumber" FROM "OrderCounter" WHERE id = 'mb_order_number';
        `
        assignedNumber = refreshed[0].lastNumber
      }

      const assignedMbNumber = `MB${assignedNumber}`

      // 5. Update Order with verified MB number
      const updatedOrder = await tx.order.update({
        where: { id: dbOrderId },
        data: {
          orderNumber: assignedMbNumber,
          status: "CONFIRMED",
          paymentStatus: "COMPLETED",
        },
      })

      // 6. Update Payment details
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            paymentId,
            status: "COMPLETED",
          },
        })
      }

      // 7. Decrement stock & increment sold count
      for (const item of order.items) {
        if (item.selectedVariantId) {
          await tx.productVariant.update({
            where: { id: item.selectedVariantId },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { sold: { increment: item.quantity } },
        })
      }

      // 8. Update coupon usage
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      sendEmailType = "confirmed"
      return {
        alreadyConfirmed: false,
        hasStockIssue: false,
        orderNumber: assignedMbNumber,
        order: updatedOrder,
      }
    })

    // Fetch full order for emails and final client response
    fullOrderToSendEmail = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: {
        items: {
          include: { product: { include: { images: true } } },
        },
        shippingAddress: true,
        payment: true,
      },
    })

    // Asynchronously send email without blocking response
    if (fullOrderToSendEmail && sendEmailType) {
      try {
        if (sendEmailType === "confirmed") {
          await sendOrderConfirmationEmail(fullOrderToSendEmail)
        } else if (sendEmailType === "cancelled") {
          await sendOrderCancelledEmail(fullOrderToSendEmail)
        }
      } catch (err) {
        console.error("Email dispatch notice:", err)
      }
    }

    return {
      success: true,
      alreadyConfirmed: result.alreadyConfirmed,
      hasStockIssue: result.hasStockIssue,
      orderNumber: result.orderNumber,
      order: fullOrderToSendEmail,
    }
  } catch (error: any) {
    console.error("=== ORDER CONFIRMATION ATOMIC FAILURE ===")
    console.error(`DB Order ID         : ${dbOrderId}`)
    console.error(`Payment ID          : ${paymentId}`)
    console.error(`Razorpay Order ID   : ${razorpayOrderId || "N/A"}`)
    console.error(`Error               : ${error.message}`)
    console.error(`Time                : ${new Date().toISOString()}`)
    console.error("=========================================")

    return {
      success: false,
      alreadyConfirmed: false,
      error: error.message || "Order confirmation transaction failed",
    }
  }
}

/**
 * Self-healing routine:
 * Ensures any confirmed orders created by legacy production deployments without an MB number
 * are atomically assigned the next sequential #MB numbers in chronological order.
 * Also formats any legacy pending orders to clean PENDING-XXXXXXXX format.
 */
export async function autoAssignMissingMbNumbers(): Promise<number> {
  try {
    const unassignedCount = await prisma.order.count({
      where: {
        status: "CONFIRMED",
        paymentStatus: "COMPLETED",
        NOT: { orderNumber: { startsWith: "MB" } },
      },
    })

    const unformattedPendingCount = await prisma.order.count({
      where: {
        status: "PENDING",
        NOT: { orderNumber: { startsWith: "PENDING" } },
      },
    })

    if (unassignedCount === 0 && unformattedPendingCount === 0) return 0

    return await prisma.$transaction(async (tx) => {
      let assignedCount = 0

      // 1. Process confirmed orders without MB
      if (unassignedCount > 0) {
        const orders = await tx.order.findMany({
          where: {
            status: "CONFIRMED",
            paymentStatus: "COMPLETED",
            NOT: { orderNumber: { startsWith: "MB" } },
          },
          orderBy: { createdAt: "asc" },
        })

        if (orders.length > 0) {
          const counter = await tx.orderCounter.findUnique({
            where: { id: "mb_order_number" },
          })

          let currentMb = counter ? counter.lastNumber : 895

          for (const order of orders) {
            currentMb += 1
            await tx.order.update({
              where: { id: order.id },
              data: { orderNumber: `MB${currentMb}` },
            })
            assignedCount += 1
          }

          await tx.orderCounter.upsert({
            where: { id: "mb_order_number" },
            create: { id: "mb_order_number", lastNumber: currentMb },
            update: { lastNumber: currentMb, updatedAt: new Date() },
          })
        }
      }

      // 2. Format legacy pending orders
      if (unformattedPendingCount > 0) {
        const legacyPending = await tx.order.findMany({
          where: {
            status: "PENDING",
            NOT: { orderNumber: { startsWith: "PENDING" } },
          },
          take: 50,
        })
        for (const po of legacyPending) {
          const suffix = (po.orderNumber || po.id).slice(-10).toUpperCase()
          await tx.order.update({
            where: { id: po.id },
            data: { orderNumber: `PENDING-${suffix}` },
          })
        }
      }

      return assignedCount
    })
  } catch (error) {
    console.error("autoAssignMissingMbNumbers error:", error)
    return 0
  }
}

