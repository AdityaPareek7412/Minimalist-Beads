"use client"

import { useState } from "react"
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils/helpers"

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState("")

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setOrder(null)

    try {
      const res = await fetch(`/api/orders/track?number=${orderNumber}&email=${email}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.order)
      } else {
        setError(data.error || "Order not found. Please check your details.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusStep = (status: string) => {
    const steps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]
    return steps.indexOf(status)
  }

  const statusIcons: any = {
    PENDING: Clock,
    CONFIRMED: CheckCircle,
    PROCESSING: Package,
    SHIPPED: Truck,
    DELIVERED: CheckCircle,
  }

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">Track Your Order</h1>
          <p className="text-gray-500">Enter your order details to see real-time updates on your delivery.</p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
          <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Order Number</label>
              <input type="text" required placeholder="e.g. #cl..." value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
            </div>
            <div className="md:col-span-1 flex items-end">
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                Track Order
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>

        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Status Stepper */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 relative">
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(getStatusStep(order.status) / 4) * 100}%` }} className="h-full bg-pink-500" />
                  </div>

                  {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((s, i) => {
                    const Icon = statusIcons[s] || Package
                    const active = getStatusStep(order.status) >= i
                    return (
                      <div key={s} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${active ? 'bg-pink-500 border-pink-100 text-white shadow-lg shadow-pink-200' : 'bg-white border-gray-100 text-gray-300'}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-pink-600' : 'text-gray-400'}`}>{s}</p>
                          {active && order.updatedAt && i === getStatusStep(order.status) && (
                            <p className="text-[9px] text-gray-400 mt-0.5">{new Date(order.updatedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Items */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Package className="text-pink-500" /> Order Items</h2>
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] && <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">{item.product?.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} • {formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking & Address */}
                <div className="space-y-8">
                  {order.trackingId && (
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg shadow-pink-200">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Truck /> Tracking Info</h2>
                      <p className="text-sm opacity-90 mb-2">Tracking ID:</p>
                      <p className="text-2xl font-black mb-6 font-mono tracking-tighter">{order.trackingId}</p>
                      {order.trackingUrl && (
                        <a href={order.trackingUrl} target="_blank" className="inline-block px-6 py-2 bg-white text-pink-600 font-bold rounded-lg text-sm hover:shadow-xl transition-all">Track Live on Map 📍</a>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><MapPin className="text-pink-500" /> Shipping To</h2>
                    <p className="text-sm font-bold text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {order.shippingAddress?.street}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
