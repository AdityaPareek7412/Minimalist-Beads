import prisma from "@/lib/prisma"
import OrdersView from "./OrdersView"
import { autoAssignMissingMbNumbers } from "@/lib/order-confirmation"

// Force dynamic to always fetch the latest order data
export const dynamic = "force-dynamic"

interface AdminOrdersPageProps {
  searchParams: {
    search?: string
    payment?: string
    status?: string
    dateRange?: string
    exactDate?: string
    fromDate?: string
    toDate?: string
    page?: string
    pageSize?: string
  }
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  // Self-healing: automatically assign sequential MB numbers if any legacy orders were placed
  await autoAssignMissingMbNumbers()

  const search = (searchParams.search || "").trim().toLowerCase()
  const payment = (searchParams.payment || "").toUpperCase()
  const status = (searchParams.status || "").toUpperCase()
  const dateRange = (searchParams.dateRange || "").toLowerCase()
  const exactDate = (searchParams.exactDate || "").trim()
  const page = Math.max(1, parseInt(searchParams.page || "1", 10))
  const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.pageSize || "25", 10)))

  const where: any = {}

  // 1. Payment status filter
  if (payment === "PAID") {
    where.paymentStatus = "COMPLETED"
  } else if (payment === "UNPAID") {
    where.paymentStatus = "PENDING"
  } else if (payment === "FAILED") {
    where.paymentStatus = "FAILED"
  } else if (payment === "REFUNDED") {
    where.paymentStatus = "REFUNDED"
  }

  // 2. Order status filter
  if (status && status !== "ALL") {
    where.status = status
  }

  // 3. Date filtering
  const now = new Date()
  if (exactDate) {
    // Exact calendar day in IST (Indian Standard Time UTC+5:30)
    // Matches orders between YYYY-MM-DDT00:00:00+05:30 and YYYY-MM-DDT23:59:59.999+05:30
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
  }

  // 4. Search filter (#MB number, internal ID, customer name, email, phone)
  if (search) {
    const cleanSearch = search.replace(/^#/, "")
    where.OR = [
      { orderNumber: { contains: cleanSearch, mode: "insensitive" } },
      { id: { contains: cleanSearch, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search, mode: "insensitive" } },
    ]
  }

  // Execute efficient paginated query + count in parallel
  const [totalCount, ordersRaw, statsCounts, revenueAgg] = await Promise.all([
    // Total matching orders for pagination
    prisma.order.count({ where }),

    // Paginated orders (only 25 items fetched, saving 95%+ Supabase bandwidth)
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        shippingAddress: true,
        payment: true,
        items: {
          include: {
            product: {
              include: { images: true }
            }
          }
        }
      }
    }),

    // Lightweight KPI aggregations (grouped counts without full row serialization)
    Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: "COMPLETED", status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { paymentStatus: "PENDING" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
    ]),

    // Total lifetime verified revenue (excluding cancelled orders)
    prisma.order.aggregate({
      where: { paymentStatus: "COMPLETED", status: { not: "CANCELLED" } },
      _sum: { total: true }
    })
  ])

  // Serialize orders for client component
  const orders = ordersRaw.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    payment: o.payment ? {
      ...o.payment,
      createdAt: o.payment.createdAt.toISOString(),
      updatedAt: o.payment.updatedAt.toISOString(),
    } : null,
    items: o.items.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
    }))
  }))

  const stats = {
    total: statsCounts[0],
    paid: statsCounts[1],
    unpaid: statsCounts[2],
    pendingStatus: statsCounts[3],
    delivered: statsCounts[4],
    revenue: revenueAgg._sum.total || 0,
  }

  return (
    <OrdersView
      orders={orders as any}
      totalOrders={totalCount}
      currentPage={page}
      pageSize={pageSize}
      stats={stats}
    />
  )
}
