// app/api/admin/orders/export/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // 🔒 Admin only
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const search = (searchParams.get("search") || "").trim().toLowerCase()
    const payment = searchParams.get("payment") || ""
    const status = searchParams.get("status") || ""
    const dateRange = (searchParams.get("dateRange") || "").toLowerCase()
    const exactDate = (searchParams.get("exactDate") || "").trim()
    const fromDate = searchParams.get("fromDate") || ""
    const toDate = searchParams.get("toDate") || ""
    const ids = searchParams.get("ids") || "" // comma-separated IDs if bulk selection

    const where: any = {}

    // Specific selected orders for bulk export
    if (ids) {
      const idList = ids.split(",").map(i => i.trim()).filter(Boolean)
      if (idList.length > 0) {
        where.id = { in: idList }
      }
    } else {
      // Payment filter
      if (payment === "PAID") {
        where.paymentStatus = "COMPLETED"
      } else if (payment === "UNPAID") {
        where.paymentStatus = "PENDING"
      } else if (payment === "FAILED") {
        where.paymentStatus = "FAILED"
      } else if (payment === "REFUNDED") {
        where.paymentStatus = "REFUNDED"
      }

      // Order status filter
      if (status && status !== "ALL") {
        where.status = status
      }

      // Date filtering
      const now = new Date()
      if (exactDate) {
        const startOfExact = new Date(`${exactDate}T00:00:00+05:30`)
        const endOfExact = new Date(`${exactDate}T23:59:59.999+05:30`)
        if (!isNaN(startOfExact.getTime()) && !isNaN(endOfExact.getTime())) {
          where.createdAt = { gte: startOfExact, lte: endOfExact }
        }
      } else if (dateRange === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        where.createdAt = { gte: startOfDay }
      } else if (dateRange === "yesterday") {
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0)
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999)
        where.createdAt = { gte: startOfYesterday, lte: endOfYesterday }
      } else if (dateRange === "7d") {
        const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        where.createdAt = { gte: past7 }
      } else if (dateRange === "30d") {
        const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        where.createdAt = { gte: past30 }
      } else if (dateRange === "custom" && fromDate) {
        where.createdAt = {
          gte: new Date(fromDate),
          ...(toDate ? { lte: new Date(toDate + "T23:59:59.999Z") } : {})
        }
      }

      // Search filter
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { id: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { customerEmail: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search, mode: "insensitive" } },
        ]
      }
    }

    // Limit maximum export rows for safety
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 2000,
      include: {
        shippingAddress: true,
        payment: true,
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    })

    // Escape CSV cell value
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""'
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }

    // IST Formatter
    const formatIST = (date: Date) => {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }).format(new Date(date))
    }

    // CSV Header row
    const headers = [
      "Order Number",
      "Internal ID",
      "Date (IST)",
      "Customer Name",
      "Email",
      "Phone",
      "Address",
      "City",
      "State",
      "Pincode",
      "Items Summary",
      "Subtotal",
      "Shipping Fee",
      "Discount",
      "Total Amount",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Tracking ID",
      "Customer Note"
    ]

    const csvRows = [headers.join(",")]

    for (const o of orders) {
      const itemsSummary = o.items
        .map(i => `${i.product?.name || "Product"} (x${i.quantity}${i.selectedVariantName ? ` - ${i.selectedVariantName}` : ""})`)
        .join("; ")

      const addr = o.shippingAddress

      const row = [
        escapeCsv(o.orderNumber.startsWith("MB") || o.orderNumber.startsWith("PENDING") ? `#${o.orderNumber}` : `#${o.orderNumber}`),
        escapeCsv(o.id),
        escapeCsv(formatIST(o.createdAt)),
        escapeCsv(o.customerName || "Guest"),
        escapeCsv(o.customerEmail || ""),
        escapeCsv(o.customerPhone || ""),
        escapeCsv(addr?.street || ""),
        escapeCsv(addr?.city || ""),
        escapeCsv(addr?.state || ""),
        escapeCsv(addr?.postalCode || ""),
        escapeCsv(itemsSummary),
        escapeCsv(o.subtotal.toFixed(2)),
        escapeCsv(o.shippingCost.toFixed(2)),
        escapeCsv(o.discount.toFixed(2)),
        escapeCsv(o.total.toFixed(2)),
        escapeCsv(o.payment?.paymentMethod || "RAZORPAY"),
        escapeCsv(o.paymentStatus),
        escapeCsv(o.status),
        escapeCsv(o.trackingId || ""),
        escapeCsv(o.customerNote || "")
      ]

      csvRows.push(row.join(","))
    }

    const csvContent = "\uFEFF" + csvRows.join("\r\n") // BOM for Excel UTF-8 support

    const todayDate = new Date().toISOString().split("T")[0]
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="minimalist-beads-orders-${todayDate}.csv"`,
      }
    })
  } catch (error: any) {
    console.error("Export orders error:", error)
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 })
  }
}
