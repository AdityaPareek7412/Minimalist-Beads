// src/components/common/Header.tsx

"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useCart } from "@/context/cartContext"
import { useWishlist } from "@/context/wishlistContext"
import { Heart, ShoppingBag, Search, Menu, X, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [settings, setSettings] = useState<any>(null)
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const cartCount = getCartCount()
  const wishlistCount = wishlistItems.length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`)
      setShowSearch(false)
      setSearchQuery("")
    }
  }

  const navItems = [
    { name: "Resin Art", href: "/shop?category=resin-art" },
    { name: "Aesthetic Rings", href: "/shop?category=aesthetic-rings" },
    { name: "Handmade", href: "/shop?category=handmade-charms" },
    { name: "Limited Drops", href: "/shop?category=limited-drops" },
    { name: "All Products", href: "/shop" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-pink-100/60 shadow-sm">
      {settings?.announcement && (
        <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white text-center py-2 text-[10px] font-semibold tracking-[0.15em] uppercase">
          {settings.announcement}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 overflow-hidden rounded-full border-2 border-pink-200 group-hover:border-pink-400 transition-all duration-500 shadow-md">
              <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-pink-200', 'to-rose-300');
                }}
              />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-gray-900 sm:inline hidden group-hover:text-pink-600 transition-colors">
              MinimalistBeads
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium px-4 py-2 rounded-full text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2.5 hover:bg-pink-50 rounded-full transition-all group"
            >
              <Search size={20} className="text-gray-500 group-hover:text-pink-600" />
            </button>
            
            <Link href="/wishlist" className="p-2.5 hover:bg-pink-50 rounded-full transition-all relative group">
              <Heart size={20} className="text-gray-500 group-hover:text-pink-600" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="p-2.5 hover:bg-pink-50 rounded-full transition-all relative group">
              <ShoppingBag size={20} className="text-gray-500 group-hover:text-pink-600" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-sage-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2.5 hover:bg-pink-50 rounded-full transition text-gray-700"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-pink-100/60"
            >
              <form onSubmit={handleSearch} className="py-5 flex gap-3">
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search for beautiful pieces..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-pink-50/50 border border-pink-200 rounded-full px-6 py-3.5 text-gray-900 text-sm font-medium outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all placeholder-gray-400"
                />
                <button type="submit" className="bg-gray-900 text-white px-8 rounded-full font-semibold text-sm hover:bg-pink-600 transition-all flex items-center gap-2">
                  Search <ArrowRight size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden pb-6 border-t border-pink-100/60"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-3 px-3 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
