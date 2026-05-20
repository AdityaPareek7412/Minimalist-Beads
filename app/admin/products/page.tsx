"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Plus, Trash2, Edit, ExternalLink, GripVertical, Check, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils/helpers"
import { Reorder, useDragControls } from "framer-motion"

interface ProductRowProps {
  product: any
  handleDelete: (id: string) => void
}

function ProductRow({ product, handleDelete }: ProductRowProps) {
  const dragControls = useDragControls()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const [isReadyToDrag, setIsReadyToDrag] = useState(false)
  const [isPressing, setIsPressing] = useState(false)

  const startLongPress = (event: React.PointerEvent) => {
    // Only handle primary touch / click
    if (event.button !== 0) return

    setIsPressing(true)
    startPos.current = { x: event.clientX, y: event.clientY }
    
    // Set a quick hold timer (250ms) to differentiate tap/drag from swipe scroll
    timeoutRef.current = setTimeout(() => {
      setIsReadyToDrag(true)
      dragControls.start(event)
    }, 250)
  }

  const cancelLongPress = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsReadyToDrag(false)
    setIsPressing(false)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!timeoutRef.current || isReadyToDrag) return

    const diffX = Math.abs(event.clientX - startPos.current.x)
    const diffY = Math.abs(event.clientY - startPos.current.y)

    // If they start moving their finger immediately, they are scrolling the page.
    // Cancel the drag action.
    if (diffX > 5 || diffY > 5) {
      cancelLongPress()
    }
  }

  return (
    <Reorder.Item
      value={product}
      dragListener={false}
      dragControls={dragControls}
      className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border flex items-center gap-4 transition-all select-none ${
        isReadyToDrag 
          ? "border-pink-500 shadow-xl scale-[1.02] z-50 ring-2 ring-pink-500/20" 
          : "border-gray-100 hover:border-pink-200"
      }`}
    >
      {/* Drag Handle - ONLY this element has touch listeners to protect native scroll momentum */}
      <div
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onPointerMove={handlePointerMove}
        style={{
          touchAction: isReadyToDrag ? "none" : "pan-y"
        }}
        className={`text-gray-400 flex-shrink-0 p-3 rounded-xl border border-transparent transition-all cursor-grab active:cursor-grabbing ${
          isReadyToDrag 
            ? "text-pink-500 bg-pink-50 border-pink-100" 
            : isPressing 
              ? "bg-gray-100" 
              : "hover:bg-gray-50 hover:text-pink-500"
        }`}
      >
        <GripVertical size={20} />
      </div>

      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 select-none pointer-events-none">
        {product.images?.[0]?.url && (
          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Name & Slug */}
        <div className="md:col-span-5 min-w-0">
          <div className="font-bold text-gray-900 truncate">{product.name}</div>
          <div className="text-xs text-gray-400 font-mono truncate">/{product.slug}</div>
        </div>

        {/* Category */}
        <div className="md:col-span-3">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            {product.category?.name || "Uncategorized"}
          </span>
        </div>

        {/* Price */}
        <div className="md:col-span-2">
          <div className="font-bold text-pink-600 text-sm sm:text-base">{formatPrice(product.price)}</div>
        </div>

        {/* Inventory */}
        <div className="md:col-span-2 flex flex-col gap-1">
          <div className="text-xs font-bold text-gray-900">{product.stock} in stock</div>
          {product.stock === 0 ? (
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded w-fit">
              Out of Stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded w-fit">
              Low Stock
            </span>
          ) : (
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded w-fit">
              Healthy
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/admin/products/edit/${product.id}`}
          className="p-2.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
          title="Edit Inventory"
        >
          <Edit className="w-4.5 h-4.5" />
        </Link>
        <button
          onClick={() => handleDelete(product.id)}
          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Delete"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
        <a
          href={`/products/${product.slug}`}
          target="_blank"
          className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
          title="View on site"
        >
          <ExternalLink className="w-4.5 h-4.5" />
        </a>
      </div>
    </Reorder.Item>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products")
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (newOrder: any[]) => {
    setProducts(newOrder)
    setSaving(true)
    try {
      const productIds = newOrder.map(p => p.id)
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      })
      if (!res.ok) throw new Error("Failed to save sorting order")
    } catch (err) {
      console.error("Failed to save reorder:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" })
      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      alert("Failed to delete product")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
              {!loading && products.length > 0 && (
                saving ? (
                  <span className="flex items-center gap-1.5 text-xs text-pink-600 font-bold bg-pink-50 px-3 py-1 rounded-full animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving order...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Order saved
                  </span>
                )
              )}
            </div>
            <p className="text-gray-500 mt-1.5 text-sm">
              Touch and hold the grip handle (⋮⋮) for a split second to drag. Swipe anywhere else to scroll the list at full native speed.
            </p>
          </div>
          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-pink-200"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">No products found. Start by adding your first aesthetic piece! ✨</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Reorder.Group values={products} onReorder={handleReorder} className="space-y-4">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  handleDelete={handleDelete}
                />
              ))}
            </Reorder.Group>
          </div>
        )}
      </div>
    </div>
  )
}
