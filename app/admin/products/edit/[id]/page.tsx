"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [stock, setStock] = useState("0")

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/products?id=${id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data)
          setStock(data.stock.toString())
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [id])

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock }),
      })

      if (res.ok) {
        router.push("/admin/products")
        router.refresh()
      } else {
        alert("Failed to update stock")
      }
    } catch (err) {
      alert("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bold">Product not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-500 hover:text-pink-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to inventory
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
               {product.images?.[0] && <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-500 text-sm">Managing stock and availability</p>
            </div>
          </div>

          <form onSubmit={handleUpdateStock} className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Inventory Management</label>
              <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-pink-500 uppercase tracking-widest mb-2">Current Stock Level</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-32 px-4 py-3 bg-white border border-pink-100 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <div className="flex flex-col">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit ${parseInt(stock) === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {parseInt(stock) === 0 ? 'Out of Stock' : 'Available'}
                       </span>
                       <p className="text-xs text-gray-400 mt-1">This will update the website instantly.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-100/50">
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    🌟 <span className="font-bold">Pro Tip:</span> Setting stock to <span className="text-red-500 font-bold">0</span> will mark the product as <span className="font-bold">SOLD OUT</span> with a special badge on your storefront.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                  saving ? "bg-gray-400" : "bg-gray-900 hover:bg-pink-600 shadow-gray-200 hover:shadow-pink-100 hover:-translate-y-1"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating Inventory...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
