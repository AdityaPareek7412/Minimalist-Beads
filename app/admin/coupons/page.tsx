"use client"

import { useState, useEffect } from "react"
import { Ticket, Plus, Trash2, Loader2, Calendar } from "lucide-react"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form State
  const [code, setCode] = useState("")
  const [type, setType] = useState("percentage")
  const [value, setValue] = useState("")
  const [minOrder, setMinOrder] = useState("0")
  const [expiry, setExpiry] = useState("")

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons")
    const data = await res.json()
    setCoupons(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, discountType: type, discountValue: value, minOrderValue: minOrder, validUntil: expiry }),
      })
      if (res.ok) {
        setCode("")
        setValue("")
        setExpiry("")
        fetchCoupons()
      } else {
        alert("Failed to create coupon")
      }
    } catch (err) {
      alert("Something went wrong")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchCoupons()
      } else {
        alert("Failed to delete coupon")
      }
    } catch (err) {
      alert("Something went wrong")
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discount Coupons</h1>
        <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-lg font-medium">
          Active Coupons: {coupons.filter(c => c.active).length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Coupon Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="text-pink-600" /> Create New
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. DIWALI20"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none uppercase font-mono text-gray-900 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-900 font-bold">
                    <option value="percentage" className="text-gray-900 bg-white">Percentage (%)</option>
                    <option value="fixed" className="text-gray-900 bg-white">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input type="number" required value={value} onChange={(e) => setValue(e.target.value)} placeholder="20"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-900 font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
                <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="date" required value={expiry} onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" />
              </div>
              <button type="submit" disabled={isCreating} className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:bg-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isCreating ? <Loader2 className="animate-spin" /> : "Create Coupon"}
              </button>
            </form>
          </div>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading coupons...</div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                      <Ticket size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-mono font-bold text-gray-900">{coupon.code}</span>
                        {!coupon.active && <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Inactive</span>}
                      </div>
                      <p className="text-sm text-gray-500">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`} 
                        {coupon.minOrderValue > 0 && ` • Min Order: ₹${coupon.minOrderValue}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                        <Calendar size={12} /> Expires:
                      </p>
                      <p className="text-sm font-medium text-gray-700">{new Date(coupon.validUntil).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(coupon.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {coupons.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-gray-400">
                  No coupons found. Create your first one! 🎁
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
