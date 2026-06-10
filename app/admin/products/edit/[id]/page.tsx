"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [stock, setStock] = useState("0")
  const [price, setPrice] = useState("0")
  const [originalPrice, setOriginalPrice] = useState("")
  const [variants, setVariants] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/products?id=${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch product details")
          return res.json()
        })
        .then(data => {
          if (data && !data.error) {
            setProduct(data)
            setStock(data.stock?.toString() || "0")
            setPrice(data.price?.toString() || "0")
            setOriginalPrice(data.originalPrice ? data.originalPrice.toString() : "")
            setVariants(data.variants || [])
          } else {
            console.error("Product fetch returned error:", data)
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Fetch product details error:", err)
          setLoading(false)
        })
    }
  }, [id])

  const addVariant = () => {
    setVariants(prev => [...prev, { name: "", price: "", stock: "10" }])
  }

  const updateVariant = (index: number, field: string, value: string) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateStockAndVariants = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formattedVariants = variants
        .filter(v => v.name.trim() !== "")
        .map(v => ({
          name: v.name.trim(),
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock) || 0
        }))

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          stock: parseInt(stock) || 0,
          price: parseFloat(price) || 0,
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          variants: formattedVariants
        }),
      })

      if (res.ok) {
        router.push("/admin/products")
        router.refresh()
      } else {
        alert("Failed to update product details")
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
      <div className="max-w-3xl mx-auto">
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
              <p className="text-gray-500 text-sm">Managing stock, variations, and availability</p>
            </div>
          </div>

          <form onSubmit={handleUpdateStockAndVariants} className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Price & Inventory Management</label>
              <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-6">
                {/* Price Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-pink-100/50">
                  <div>
                    <label className="block text-xs font-bold text-pink-500 uppercase tracking-widest mb-2">Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-pink-100 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">The main selling price of the product.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-pink-500 uppercase tracking-widest mb-2">Original Price (₹) - Optional</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 999"
                      className="w-full px-4 py-3 bg-white border border-pink-100 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">For strike-through discount comparison.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-pink-500 uppercase tracking-widest mb-2">Base Stock Level</label>
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
                       <p className="text-xs text-gray-400 mt-1">Base stock when no variant is selected.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-100/50">
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    🌟 <span className="font-bold">Pro Tip:</span> Setting stock to <span className="text-red-500 font-bold">0</span> will mark the product as <span className="font-bold">SOLD OUT</span> if it has no variants or if selected variants are also out of stock.
                  </p>
                </div>
              </div>
            </div>

            {/* Product Variants Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Product Variations</h3>
                  <p className="text-xs text-gray-500">Define colors, sizes, or styles. Leave variant price empty to inherit the base price.</p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus size={16} /> Add Variant Option
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <span className="text-2xl">✨</span>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">No Variations Added</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">This product only has one default option. Click above to add choices like color overrides.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-pink-50/20 border border-pink-100 rounded-2xl">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">Variant Name (e.g. Red, Blue, Large)</label>
                        <input
                          type="text"
                          required
                          value={variant.name}
                          onChange={(e) => updateVariant(index, "name", e.target.value)}
                          placeholder="e.g. Ocean Blue"
                          className="w-full px-4 py-2.5 bg-white border border-pink-100 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="w-full sm:w-36">
                        <label className="block text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">Price Override (₹)</label>
                        <input
                          type="number"
                          value={variant.price || ""}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          placeholder="Optional"
                          className="w-full px-4 py-2.5 bg-white border border-pink-100 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="block text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">Stock Level</label>
                        <input
                          type="number"
                          required
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, "stock", e.target.value)}
                          placeholder="10"
                          className="w-full px-4 py-2.5 bg-white border border-pink-100 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end sm:self-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                  saving ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-pink-600 shadow-gray-200 hover:shadow-pink-100 hover:-translate-y-1"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating Details...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Product Details
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
