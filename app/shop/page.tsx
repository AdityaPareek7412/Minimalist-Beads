// app/shop/page.tsx

"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/common/Header"
import { ProductCard } from "@/components/product/ProductCard"
import { motion } from "framer-motion"
import { ChevronDown, Filter, X } from "lucide-react"

function ShopContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams?.get("category")
  
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("default")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(12)

  // Reset pagination when search/filter/sort changes
  useEffect(() => {
    setVisibleCount(12)
  }, [sortBy, selectedCategories, priceRange, searchParams])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/categories")
        ])
        const prodData = await prodRes.json()
        const catData = await catRes.json()
        
        setProducts(prodData)
        setCategories(catData)

        // Set initial category from URL if present
        if (initialCategory) {
          const cat = catData.find((c: any) => c.slug.toLowerCase() === initialCategory.toLowerCase())
          if (cat) {
            setSelectedCategories([cat.id])
          }
        }
      } catch (err) {
        console.error("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [initialCategory])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Filter and Sort products
  const filteredProducts = products
    .filter(product => {
      // Category filter
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.categoryId)
      // Price filter
      const priceMatch = product.price >= priceRange.min && product.price <= priceRange.max
      // Search filter
      const searchMatch = !searchParams?.get("q") || 
        product.name.toLowerCase().includes(searchParams.get("q")!.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchParams.get("q")!.toLowerCase())
        
      return categoryMatch && priceMatch && searchMatch
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (sortBy === "trending") return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "default") return (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      return 0
    })

  const displayedProducts = filteredProducts.slice(0, visibleCount)

  return (
    <div className="min-h-screen bg-[#fdf0f5] text-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
            Shop Collection
          </h1>
          <p className="text-gray-500 font-light max-w-2xl mx-auto">
            Discover our handcrafted pieces, from aesthetic charms to limited edition drops.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-pink-100 font-bold text-xs uppercase tracking-wider text-gray-700"
          >
            <Filter size={16} />
            Filters & Categories
          </button>

          {/* Sidebar / Filters */}
          <aside className={`
            fixed inset-0 z-[60] lg:relative lg:inset-auto lg:z-auto
            transition-transform duration-300 transform
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            w-full sm:w-80 lg:w-64 flex-shrink-0 bg-[#fdf0f5] lg:bg-transparent overflow-y-auto lg:overflow-visible
          `}>
            <div className="h-full lg:h-auto bg-white lg:bg-white p-8 lg:p-6 lg:rounded-2xl shadow-xl lg:shadow-sm border-r lg:border border-pink-100 lg:sticky lg:top-24">
              <div className="flex items-center justify-between lg:hidden mb-8">
                <h2 className="text-xl font-serif font-bold">Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-pink-50 rounded-full text-pink-500">
                  <X size={20} />
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-10">
                <h3 className="text-[10px] font-bold text-pink-500 mb-5 tracking-[0.2em] uppercase">
                  CATEGORIES
                </h3>
                <div className="space-y-4">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="peer appearance-none w-5 h-5 rounded border border-pink-200 bg-pink-50/30 checked:bg-pink-500 checked:border-pink-500 transition-all cursor-pointer"
                        />
                        <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      </div>
                      <span className="ml-3 text-sm text-gray-600 group-hover:text-pink-600 transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-10">
                <h3 className="text-[10px] font-bold text-pink-500 mb-5 tracking-[0.2em] uppercase">
                  PRICE RANGE
                </h3>
                <div className="space-y-5">
                  <div className="px-1">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      className="w-full accent-pink-500 bg-pink-100 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Min</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                          className="w-full pl-6 pr-3 py-2 bg-pink-50/30 border border-pink-100 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-pink-300 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Max</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 2000 })}
                          className="w-full pl-6 pr-3 py-2 bg-pink-50/30 border border-pink-100 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-pink-300 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              {(selectedCategories.length > 0 || priceRange.max < 2000 || priceRange.min > 0) && (
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange({ min: 0, max: 2000 });
                  }}
                  className="w-full py-2.5 text-[10px] font-bold text-gray-400 hover:text-pink-500 border border-dashed border-gray-200 rounded-lg transition-all uppercase tracking-widest"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-pink-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing <span className="text-gray-900">{filteredProducts.length}</span> pieces
              </p>

              {/* Sort Dropdown */}
              <div className="mt-4 sm:mt-0 relative min-w-[180px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400">
                  <Filter size={12} />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-10 pr-10 py-2.5 bg-pink-50/30 border border-pink-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-pink-300 cursor-pointer transition-all uppercase tracking-wider"
                >
                  <option value="default">Recommended</option>
                  <option value="newest">Newest First</option>
                  <option value="trending">Most Trending</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-pink-300 uppercase tracking-[0.2em]">Crafting Magic...</p>
              </div>
            ) : displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-3xl border border-pink-100 shadow-sm">
                <div className="text-5xl mb-6 opacity-30">✨</div>
                <p className="text-xl font-serif font-bold text-gray-900 mb-2">No pieces found</p>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange({ min: 0, max: 2000 });
                  }}
                  className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-pink-500 transition-all uppercase tracking-widest"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Load More */}
            {!loading && visibleCount < filteredProducts.length && (
              <div className="mt-16 text-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-10 py-4 bg-white border border-pink-100 text-gray-700 font-bold text-xs rounded-full hover:bg-pink-50 hover:border-pink-200 transition-all shadow-sm uppercase tracking-[0.2em]"
                >
                  View More Pieces
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fdf0f5] text-pink-400 font-serif text-2xl italic">Loading Magic...</div>}>
      <ShopContent />
    </Suspense>
  )
}
