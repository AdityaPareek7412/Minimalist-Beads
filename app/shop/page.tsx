// app/shop/page.tsx

"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/common/Header"
import { ProductCard } from "@/components/product/ProductCard"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

function ShopContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams?.get("category")
  
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })

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
      return categoryMatch && priceMatch
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (sortBy === "trending") return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
      if (sortBy === "newest") return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)
      return 0
    })

  return (
    <div className="min-h-screen relative z-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 glass-card p-6 rounded-3xl h-fit sticky top-28 border border-white/10">
            {/* Categories Filter */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-fuchsia-400 mb-4 tracking-widest uppercase">
                CATEGORIES
              </h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-black/50 text-fuchsia-500 focus:ring-fuchsia-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-fuchsia-400 mb-4 tracking-widest uppercase">
                PRICE RANGE
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-full accent-fuchsia-500"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 bg-black/40 border border-white/20 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 1000 })}
                    className="w-20 px-2 py-1 bg-black/40 border border-white/20 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <h3 className="text-sm font-bold text-fuchsia-400 mb-4 tracking-widest uppercase">
                AVAILABILITY
              </h3>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-gray-600 bg-black/50 text-fuchsia-500 focus:ring-fuchsia-500"
                  />
                  <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">In Stock</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between glass-card p-6 rounded-3xl border border-white/10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 drop-shadow-md">
                  Shop Collection
                </h1>
                <p className="text-gray-300 font-light">
                  {filteredProducts.length} aesthetic pieces found
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="mt-4 sm:mt-0 relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-6 py-3 bg-black/40 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-fuchsia-500 pr-10 backdrop-blur-md"
                >
                  <option value="newest">Newest</option>
                  <option value="trending">Trending</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredProducts.length > 0 ? (
              <div className="mt-12 text-center">
                <button className="px-8 py-3 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">
                  Load More Magic ✨
                </button>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400 font-light">No pieces found in this category.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <ShopContent />
    </Suspense>
  )
}
