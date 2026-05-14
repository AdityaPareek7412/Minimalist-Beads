"use client"

import { useState } from "react"
import { Check, ChevronDown, Loader2, Truck } from "lucide-react"

const statuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
]

export default function OrderStatusDropdown({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  // Tracking inputs
  const [showTrackingForm, setShowTrackingForm] = useState(false)
  const [tId, setTId] = useState("")
  const [tUrl, setTUrl] = useState("")

  const updateStatus = async (newStatus: string) => {
    if (newStatus === "SHIPPED") {
      setShowTrackingForm(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
        setIsOpen(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTrackingSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          status: "SHIPPED",
          trackingId: tId,
          trackingUrl: tUrl
        }),
      })
      if (res.ok) {
        setStatus("SHIPPED")
        setShowTrackingForm(false)
        setIsOpen(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'SHIPPED': return 'bg-purple-100 text-purple-700'
      case 'DELIVERED': return 'bg-green-100 text-green-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-transparent hover:border-pink-200 ${getStatusColor(status)}`}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : status}
        <ChevronDown size={14} />
      </button>

      {isOpen && !showTrackingForm && (
        <div className="absolute z-20 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-hidden">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-pink-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {showTrackingForm && (
        <div className="absolute z-30 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 right-0">
          <h4 className="text-xs font-black uppercase mb-3 flex items-center gap-2"><Truck size={14} /> Shipping Details</h4>
          <input type="text" placeholder="AWB / Tracking ID" value={tId} onChange={e => setTId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs mb-2 outline-none focus:border-pink-400" />
          <input type="text" placeholder="Tracking Link (Optional)" value={tUrl} onChange={e => setTUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs mb-3 outline-none focus:border-pink-400" />
          <div className="flex gap-2">
            <button onClick={() => setShowTrackingForm(false)} className="flex-1 py-2 text-[10px] font-bold text-gray-400 hover:text-gray-600">Cancel</button>
            <button onClick={handleTrackingSubmit} className="flex-1 py-2 bg-pink-600 text-white text-[10px] font-bold rounded-lg hover:bg-pink-700 transition-all">Ship Order</button>
          </div>
        </div>
      )}
    </div>
  )
}
