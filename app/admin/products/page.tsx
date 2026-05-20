"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Trash2, Edit, ExternalLink, GripVertical, Check, Loader2, Settings, ChevronUp, ChevronDown } from "lucide-react"
import { formatPrice } from "@/lib/utils/helpers"
import { Reorder } from "framer-motion"

// Static Row for Normal Mode - 100% native HTML, zero drag listeners, super smooth scrolling.
function StaticProductRow({ product, handleDelete }: { product: any, handleDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-pink-200 transition-all">
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
    </div>
  )
}

// Compact Draggable Row for Reorder Mode - optimized with touch buttons for easy mobile sorting.
function DraggableProductRow({ 
  product, 
  index, 
  totalItems, 
  onMoveUp, 
  onMoveDown, 
  onMoveToPosition 
}: { 
  product: any, 
  index: number, 
  totalItems: number,
  onMoveUp: () => void,
  onMoveDown: () => void,
  onMoveToPosition: (newPos: number) => void
}) {
  return (
    <Reorder.Item
      value={product}
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-4 cursor-row-resize hover:border-pink-200 active:border-pink-500 active:scale-[1.01] transition-all select-none"
    >
      <div className="text-gray-400 flex-shrink-0">
        <GripVertical size={20} />
      </div>
      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 pointer-events-none">
        {product.images?.[0]?.url && (
          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 truncate text-sm">{product.name}</div>
        <div className="text-xs text-gray-400 font-mono truncate">/{product.slug}</div>
      </div>
      <div className="text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full flex-shrink-0">
        {formatPrice(product.price)}
      </div>
      
      {/* Arrow Controls for Mobile and Precision Reordering */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Move Up"
        >
          <ChevronUp size={16} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            const targetPosStr = prompt(`Enter new position for "${product.name}" (1 to ${totalItems}):`, (index + 1).toString());
            if (targetPosStr) {
              const targetPos = parseInt(targetPosStr, 10);
              if (!isNaN(targetPos) && targetPos >= 1 && targetPos <= totalItems) {
                onMoveToPosition(targetPos - 1);
              } else {
                alert(`Please enter a valid number between 1 and ${totalItems}`);
              }
            }
          }}
          className="bg-pink-50 hover:bg-pink-100 text-pink-700 px-2.5 py-1 rounded text-xs font-bold font-mono transition-colors"
          title="Click to jump to position"
        >
          #{index + 1}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalItems - 1}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Move Down"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </Reorder.Item>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(20)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setVisibleCount(20)
  }, [searchQuery])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category?.name && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const displayedProducts = filteredProducts.slice(0, visibleCount)
  // Limit reorder to top 50 items to prevent browser lag with 1500+ items
  const reorderProducts = products.slice(0, 50)

  const moveUp = (index: number) => {
    if (index === 0) return
    const newTopOrder = [...reorderProducts]
    const temp = newTopOrder[index]
    newTopOrder[index] = newTopOrder[index - 1]
    newTopOrder[index - 1] = temp
    handleReorder(newTopOrder)
  }

  const moveDown = (index: number) => {
    if (index >= reorderProducts.length - 1) return
    const newTopOrder = [...reorderProducts]
    const temp = newTopOrder[index]
    newTopOrder[index] = newTopOrder[index + 1]
    newTopOrder[index + 1] = temp
    handleReorder(newTopOrder)
  }

  const moveToPosition = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= reorderProducts.length || fromIndex === toIndex) return
    const newTopOrder = [...reorderProducts]
    const [movedItem] = newTopOrder.splice(fromIndex, 1)
    newTopOrder.splice(toIndex, 0, movedItem)
    handleReorder(newTopOrder)
  }

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

  const handleReorder = async (newTopOrder: any[]) => {
    const updatedProducts = [...newTopOrder, ...products.slice(50)]
    setProducts(updatedProducts)
    setSaving(true)
    try {
      const productIds = updatedProducts.map(p => p.id)
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
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {isReorderMode ? "Sort Products" : "Manage Products"}
              </h1>
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
              {isReorderMode 
                ? "Drag and drop the items below to customize their display order, then click Finish."
                : "Manage product stock and catalog with 100% native smooth scrolling."
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isReorderMode ? (
              <button
                onClick={() => setIsReorderMode(false)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-100"
              >
                <Check className="w-5 h-5" />
                Finish & Save
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsReorderMode(true)}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  <GripVertical className="w-4.5 h-4.5 text-pink-400" />
                  Sort Products
                </button>
                <Link
                  href="/admin/products/add"
                  className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-pink-200"
                >
                  <Plus className="w-5 h-5" />
                  Add New Product
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {!isReorderMode && !loading && products.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products by name, slug, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm font-medium"
            />
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">No products found. Start by adding your first aesthetic piece! ✨</p>
          </div>
        ) : isReorderMode ? (
          /* Draggable List for Reorder Mode */
          <div className="max-w-2xl mx-auto space-y-3 bg-gray-100/50 p-4 rounded-3xl border border-gray-200">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-2">
              Drag top 50 items below to sort
            </div>
            <Reorder.Group values={reorderProducts} onReorder={handleReorder} className="space-y-2">
              {reorderProducts.map((product, idx) => (
                <DraggableProductRow 
                  key={product.id} 
                  product={product} 
                  index={idx}
                  totalItems={reorderProducts.length}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                  onMoveToPosition={(targetPos) => moveToPosition(idx, targetPos)}
                />
              ))}
            </Reorder.Group>
            {products.length > 50 && (
              <div className="text-xs text-center text-gray-400 mt-2 italic">
                Only the top 50 products are loaded for reordering to ensure smooth performance.
              </div>
            )}
          </div>
        ) : (
          /* Static List for Normal Mode - Super smooth, 100% native momentum scrolling with search + load more */
          <div className="space-y-6">
            {displayedProducts.length > 0 ? (
              <div className="space-y-4">
                {displayedProducts.map((product) => (
                  <StaticProductRow
                    key={product.id}
                    product={product}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <p className="text-gray-400 text-lg">No products match your search query.</p>
              </div>
            )}

            {/* Load More Button */}
            {!loading && visibleCount < filteredProducts.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-pink-50 hover:border-pink-200 transition-all shadow-sm uppercase tracking-wider"
                >
                  Load More Products ({filteredProducts.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
