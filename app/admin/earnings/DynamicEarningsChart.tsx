"use client"

import { useState, useMemo } from "react"
import { formatPrice } from "@/lib/utils/helpers"

type OrderData = {
  createdAt: Date
  total: number
}

type Props = {
  orders: OrderData[]
  totalEarnings: number
  todayEarnings: number
}

export default function DynamicEarningsChart({ orders, totalEarnings, todayEarnings }: Props) {
  const [range, setRange] = useState<"7" | "30" | "thisMonth" | "lastMonth">("7")

  const dailyData = useMemo(() => {
    const days: { date: string, earnings: number, count: number }[] = []
    
    const getISTDayString = (date: Date) => {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      }).format(new Date(date))
    }

    const today = new Date()
    
    if (range === "7" || range === "30") {
      const numDays = parseInt(range)
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        days.push({ date: getISTDayString(d), earnings: 0, count: 0 })
      }
    } else if (range === "thisMonth") {
      const year = today.getFullYear()
      const month = today.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({ date: getISTDayString(new Date(year, month, i)), earnings: 0, count: 0 })
      }
    } else if (range === "lastMonth") {
      const year = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()
      const month = today.getMonth() === 0 ? 11 : today.getMonth() - 1
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({ date: getISTDayString(new Date(year, month, i)), earnings: 0, count: 0 })
      }
    }

    orders.forEach(o => {
      const dateStr = getISTDayString(new Date(o.createdAt))
      const day = days.find(d => d.date === dateStr)
      if (day) {
        day.earnings += o.total
        day.count += 1
      }
    })

    return days
  }, [orders, range])

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
  }).format(new Date())

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Today's Earnings</p>
            <h3 className="text-3xl font-black text-emerald-700">{formatPrice(todayEarnings)}</h3>
          </div>
          <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-xl text-2xl">📅</div>
        </div>

        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-1">Total Lifetime Earnings</p>
            <h3 className="text-3xl font-black text-pink-700">{formatPrice(totalEarnings)}</h3>
          </div>
          <div className="p-3 bg-pink-100/50 text-pink-600 rounded-xl text-2xl">💰</div>
        </div>
      </div>

      {/* Dynamic Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📊 Day-wise Earnings
          </h2>
          <select 
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-pink-500 focus:border-pink-500 block p-2.5 font-medium outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {dailyData.map((day) => {
            const isToday = day.date === todayStr

            return (
              <div 
                key={day.date} 
                className={`p-4 rounded-xl border text-center transition-all ${
                  isToday 
                    ? "bg-pink-50 border-pink-200 shadow-sm ring-1 ring-pink-200" 
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100/50"
                }`}
              >
                <p className="text-xs font-semibold text-gray-500 mb-1">{day.date.split(' ').slice(0, 2).join(' ')}</p>
                <p className={`text-base font-black ${isToday ? "text-pink-600" : "text-gray-800"}`}>
                  {formatPrice(day.earnings)}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">{day.count} orders</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
