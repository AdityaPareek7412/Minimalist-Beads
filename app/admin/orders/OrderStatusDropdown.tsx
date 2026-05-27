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
  const [courier, setCourier] = useState("indiapost")
  const [tUrl, setTUrl] = useState("https://www.indiapost.gov.in/#trackandtrace")

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
        <div className="absolute z-30 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 right-0 text-gray-800">
          <h4 className="text-xs font-black uppercase mb-3 flex items-center gap-2 text-gray-900"><Truck size={14} /> Shipping Details</h4>
          
          <div className="mb-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Courier Partner</label>
            <select
              value={courier}
              onChange={(e) => {
                const val = e.target.value
                setCourier(val)
                if (val === "indiapost") {
                  setTUrl("https://www.indiapost.gov.in/#trackandtrace")
                } else if (val === "tirupati") {
                  setTUrl("https://trackcourier.io/tirupati-courier-tracking")
                } else {
                  setTUrl("")
                }
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-pink-400 font-medium text-gray-700"
            >
              <option value="indiapost">India Post</option>
              <option value="tirupati">Tirupati Courier</option>
              <option value="custom">Other / Custom Link</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">AWB / Tracking ID</label>
            <input 
              type="text" 
              placeholder="AWB / Tracking ID" 
              value={tId} 
              onChange={e => setTId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-pink-400 font-medium text-gray-700" 
            />
          </div>

          {courier === "custom" && (
            <div className="mb-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Tracking Link</label>
              <input 
                type="text" 
                placeholder="Tracking Link (Optional)" 
                value={tUrl} 
                onChange={e => setTUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-pink-400 font-medium text-gray-700" 
              />
            </div>
          )}

          <div className="flex gap-2">
            <button 
              onClick={() => setShowTrackingForm(false)} 
              className="flex-1 py-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleTrackingSubmit} 
              className="flex-1 py-2 bg-pink-600 text-white text-[10px] font-bold rounded-lg hover:bg-pink-700 transition-all shadow-md shadow-pink-100"
            >
              Ship Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
