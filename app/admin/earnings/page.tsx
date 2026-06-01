import prisma from "@/lib/prisma"
import LogoutButton from "../orders/LogoutButton"
import DynamicEarningsChart from "./DynamicEarningsChart"

export const dynamic = "force-dynamic"

export default async function AdminEarningsPage() {
  const earnedStatuses = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]
  
  const orders = await prisma.order.findMany({
    where: { status: { in: earnedStatuses as any } },
    select: { createdAt: true, total: true }
  })

  const totalEarnings = orders.reduce((acc, o) => acc + o.total, 0)
  
  const getISTDayString = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    }).format(new Date(date))
  }

  const todayISTString = getISTDayString(new Date())
  const todayEarnings = orders
    .filter(o => getISTDayString(o.createdAt) === todayISTString)
    .reduce((acc, o) => acc + o.total, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard - Earnings</h1>
          <LogoutButton />
        </div>

        <DynamicEarningsChart 
          orders={orders} 
          totalEarnings={totalEarnings} 
          todayEarnings={todayEarnings} 
        />
      </div>
    </div>
  )
}
