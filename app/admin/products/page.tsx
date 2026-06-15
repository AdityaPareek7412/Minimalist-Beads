"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Plus, Trash2, Edit, ExternalLink, Check, Loader2, Settings, ChevronUp, ChevronDown, GripVertical, Upload, Download, RotateCcw } from "lucide-react"
import { formatPrice, getImageUrl } from "@/lib/utils/helpers"

// Static Row for Normal Mode - 100% native HTML, zero drag listeners, super smooth scrolling.
function StaticProductRow({ 
  product, 
  handleDelete, 
  handleRestore 
}: { 
  product: any, 
  handleDelete: (id: string) => void,
  handleRestore: (id: string) => void
}) {
  return (
    <div 
      id={`product-row-${product.id}`}
      className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border flex items-center gap-4 hover:border-pink-200 transition-all ${product.isArchived ? 'opacity-75 bg-gray-50/50 border-dashed border-gray-200' : 'border-gray-100'}`}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 select-none pointer-events-none">
        {product.images?.[0]?.url && (
          <img src={getImageUrl(product.images[0].url)} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Name & Slug */}
        <div className="md:col-span-5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-bold text-gray-900 truncate">{product.name}</div>
            {product.isArchived && (
              <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[9px] font-bold uppercase tracking-wider">
                Archived
              </span>
            )}
          </div>
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
        {!product.isArchived ? (
          <>
            <Link
              href={`/admin/products/edit/${product.id}`}
              onClick={() => {
                sessionStorage.setItem("lastEditedProductId", product.id)
              }}
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
          </>
        ) : (
          <button
            onClick={() => handleRestore(product.id)}
            className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
            title="Restore / Unarchive"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
        )}
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

// Compact Row for Reorder Mode - optimized with touch buttons for easy mobile sorting.
function SortProductRow({ 
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
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-pink-200 transition-all">
      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 pointer-events-none">
        {product.images?.[0]?.url && (
          <img src={getImageUrl(product.images[0].url)} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 truncate text-sm">{product.name}</div>
        <div className="text-xs text-gray-400 font-mono truncate">/{product.slug}</div>
      </div>
      <div className="text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full flex-shrink-0">
        {formatPrice(product.price)}
      </div>
      
      {/* Precision Controls */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Move Up"
        >
          <ChevronUp size={16} />
        </button>

        <button
          onClick={() => {
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
          onClick={onMoveDown}
          disabled={index === totalItems - 1}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Move Down"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [visibleCount, setVisibleCount] = useState(20)
  
  const [sortSearchQuery, setSortSearchQuery] = useState("")
  const [sortVisibleCount, setSortVisibleCount] = useState(50)

  const normalLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const sortLoadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setVisibleCount(20)
  }, [searchQuery, showArchived])

  useEffect(() => {
    setSortVisibleCount(50)
  }, [sortSearchQuery])

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category?.name && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesArchive = showArchived ? product.isArchived : !product.isArchived
    return matchesSearch && matchesArchive
  })

  const sortedFilteredProducts = products
    .map((product: any, index: number) => ({ product, index }))
    .filter(({ product }: any) => {
      const matchesSearch = product.name.toLowerCase().includes(sortSearchQuery.toLowerCase()) ||
        product.slug.toLowerCase().includes(sortSearchQuery.toLowerCase()) ||
        (product.category?.name && product.category.name.toLowerCase().includes(sortSearchQuery.toLowerCase()))
      
      return matchesSearch && !product.isArchived
    })

  // Restore scroll position to last edited product
  useEffect(() => {
    if (loading) return

    const lastEditedProductId = sessionStorage.getItem("lastEditedProductId")
    if (!lastEditedProductId) return

    const index = filteredProducts.findIndex((p: any) => p.id === lastEditedProductId)
    if (index === -1) {
      sessionStorage.removeItem("lastEditedProductId")
      return
    }

    if (index >= visibleCount) {
      setVisibleCount(index + 10)
      return
    }

    sessionStorage.removeItem("lastEditedProductId")

    const timer = setTimeout(() => {
      const element = document.getElementById(`product-row-${lastEditedProductId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        
        // Add a subtle brief highlight animation
        element.classList.add("ring-4", "ring-pink-100", "border-pink-300", "transition-all")
        setTimeout(() => {
          element.classList.remove("ring-4", "ring-pink-100", "border-pink-300")
        }, 2000)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [loading, filteredProducts, visibleCount])

  // Observer for Normal Mode
  useEffect(() => {
    if (loading || isReorderMode) return
    if (visibleCount >= filteredProducts.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 20, filteredProducts.length))
        }
      },
      { rootMargin: "300px" }
    )

    const currentSentinel = normalLoadMoreRef.current
    if (currentSentinel) observer.observe(currentSentinel)

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel)
    }
  }, [visibleCount, filteredProducts.length, loading, isReorderMode])

  // Observer for Sort/Reorder Mode
  useEffect(() => {
    if (loading || !isReorderMode) return
    if (sortVisibleCount >= sortedFilteredProducts.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSortVisibleCount(prev => Math.min(prev + 50, sortedFilteredProducts.length))
        }
      },
      { rootMargin: "300px" }
    )

    const currentSentinel = sortLoadMoreRef.current
    if (currentSentinel) observer.observe(currentSentinel)

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel)
    }
  }, [sortVisibleCount, sortedFilteredProducts.length, loading, isReorderMode])

  const displayedProducts = filteredProducts.slice(0, visibleCount)
  const displayedSortProducts = sortedFilteredProducts.slice(0, sortVisibleCount)

  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...products]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    handleReorder(newOrder)
  }

  const moveDown = (index: number) => {
    if (index >= products.length - 1) return
    const newOrder = [...products]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    handleReorder(newOrder)
  }

  const moveToPosition = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= products.length || fromIndex === toIndex) return
    const newOrder = [...products]
    const [movedItem] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedItem)
    handleReorder(newOrder)
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products")
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        console.error("Products is not an array:", data)
        setProducts([])
      }
    } catch (err) {
      console.error("Failed to fetch products", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (newOrder: any[]) => {
    setProducts(newOrder)
    setSaving(true)
    try {
      const productIds = newOrder.map((p: any) => p.id)
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
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      
      if (!res.ok) {
        alert(data.error || "Failed to delete product")
        return
      }

      if (data.archived) {
        alert("This product has past customer orders, so it has been archived (hidden) instead of deleted to protect order history.")
        // Update local state to reflect archived status
        setProducts(products.map((p: any) => p.id === id ? { ...p, isArchived: true } : p))
      } else {
        // Permanently deleted
        setProducts(products.filter((p: any) => p.id !== id))
        alert("Product successfully deleted.")
      }
    } catch (err) {
      alert("Failed to delete product")
    }
  }

  const handleRestore = async (id: string) => {
    try {
      const product = products.find((p: any) => p.id === id)
      if (!product) return

      const res = await fetch(`/api/admin/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isArchived: false, stock: product.stock }),
      })
      
      if (!res.ok) throw new Error("Failed to restore product")
      
      // Update local state
      setProducts(products.map((p: any) => p.id === id ? { ...p, isArchived: false } : p))
      alert("Product successfully restored!")
    } catch (err) {
      console.error(err)
      alert("Failed to restore product")
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
                  href="/admin/products/import"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold transition-all shadow-md"
                >
                  <Upload className="w-4.5 h-4.5 text-pink-500" />
                  Bulk Import (CSV)
                </Link>
                <a
                  href="/api/admin/products/export"
                  download="minimalist-beads-products.csv"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold transition-all shadow-md"
                >
                  <Download className="w-4.5 h-4.5 text-blue-500" />
                  Export CSV
                </a>
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

        {/* Search Bar & Archive Toggle */}
        {!isReorderMode && !loading && products.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search products by name, slug, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm font-medium"
            />
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl font-bold border transition-all flex items-center justify-center gap-2 shadow-sm ${showArchived ? 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              {showArchived ? "Hide Archived Products" : "Show Archived Products"}
            </button>
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
          /* Static List with precision controls for Reorder Mode */
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-2">
              <input
                type="text"
                placeholder="Search products to sort by name, slug..."
                value={sortSearchQuery}
                onChange={(e) => setSortSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-medium"
              />
            </div>
            
            <div className="space-y-2 bg-gray-100/50 p-4 rounded-3xl border border-gray-200">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-2">
                Use arrows or click position numbers to reorder
              </div>
              
              {displayedSortProducts.length > 0 ? (
                <div className="space-y-2">
                  {displayedSortProducts.map(({ product, index }: any) => (
                    <SortProductRow 
                      key={product.id} 
                      product={product} 
                      index={index}
                      totalItems={products.length}
                      onMoveUp={() => moveUp(index)}
                      onMoveDown={() => moveDown(index)}
                      onMoveToPosition={(targetPos) => moveToPosition(index, targetPos)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <p className="text-gray-400 text-sm">No products match your search query.</p>
                </div>
              )}

              {/* Load More Button for Reorder Mode */}
              {sortVisibleCount < sortedFilteredProducts.length && (
                <div ref={sortLoadMoreRef} className="text-center text-xs font-bold text-pink-500 uppercase tracking-widest py-4 animate-pulse">
                  Loading more for sorting... ({sortedFilteredProducts.length - sortVisibleCount} remaining)
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Static List for Normal Mode - Super smooth, 100% native momentum scrolling with search + load more */
          <div className="space-y-6">
            {displayedProducts.length > 0 ? (
              <div className="space-y-4">
                {displayedProducts.map((product: any) => (
                  <StaticProductRow
                    key={product.id}
                    product={product}
                    handleDelete={handleDelete}
                    handleRestore={handleRestore}
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
              <div ref={normalLoadMoreRef} className="text-center text-xs font-bold text-pink-500 uppercase tracking-widest py-6 animate-pulse">
                Loading more products... ({filteredProducts.length - visibleCount} remaining)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
