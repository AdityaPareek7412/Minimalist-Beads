"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Truck, Bell } from "lucide-react"

export default function AdminSettingsPage() {
  const [shippingFee, setShippingFee] = useState("")
  const [freeShippingLimit, setFreeShippingLimit] = useState("")
  const [announcement, setAnnouncement] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        setShippingFee(data.shippingFee.toString())
        setFreeShippingLimit(data.freeShippingLimit.toString())
        setAnnouncement(data.announcement || "")
        setLoading(false)
      })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingFee, freeShippingLimit, announcement }),
      })
      if (res.ok) alert("Settings saved successfully!")
      else alert("Failed to save settings")
    } catch (err) {
      alert("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Store Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Shipping Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <Truck className="text-pink-600 w-5 h-5" />
            <h2 className="font-bold text-gray-900">Shipping Configuration</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Fee (₹)</label>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-2">Charged on orders below the free shipping limit.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Limit (₹)</label>
              <input
                type="number"
                value={freeShippingLimit}
                onChange={(e) => setFreeShippingLimit(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-2">Orders above this amount will have ₹0 shipping.</p>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <Bell className="text-pink-600 w-5 h-5" />
            <h2 className="font-bold text-gray-900">Announcement Bar</h2>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Message</label>
            <textarea
              rows={2}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. ✨ FESTIVAL SALE: Use code DIWALI20 for 20% off!"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">This message will appear at the top of every page (Optional).</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:bg-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Save All Settings
        </button>
      </form>
    </div>
  )
}
