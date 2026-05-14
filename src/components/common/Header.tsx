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
    { name: "RESIN ART", href: "/shop?category=resin-art" },
    { name: "AESTHETIC RINGS", href: "/shop?category=aesthetic-rings" },
    { name: "HANDMADE", href: "/shop?category=handmade-charms" },
    { name: "LIMITED DROPS", href: "/shop?category=limited-drops" },
    { name: "ALL PRODUCTS", href: "/shop" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
      {settings?.announcement && (
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-center py-2 text-[10px] font-black tracking-[0.2em] uppercase">
          {settings.announcement}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 overflow-hidden rounded-full border-2 border-white/10 group-hover:border-pink-500 transition-all duration-500 shadow-2xl">
              <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-pink-400', 'to-purple-500');
                }}
              />
            </div>
            <span className="text-xl font-serif font-black tracking-tighter text-white sm:inline hidden group-hover:text-pink-400 transition-colors">
              MinimalistBeads
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[11px] font-black tracking-widest text-gray-400 hover:text-white transition-all uppercase"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all group"
            >
              <Search size={20} className="text-gray-400 group-hover:text-white" />
            </button>
            
            <Link href="/wishlist" className="p-2.5 hover:bg-white/10 rounded-xl transition-all relative group">
              <Heart size={20} className="text-gray-400 group-hover:text-white" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-black animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="p-2.5 hover:bg-white/10 rounded-xl transition-all relative group">
              <ShoppingBag size={20} className="text-gray-400 group-hover:text-white" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-purple-500 text-white text-[9px] rounded-full flex items-center justify-center font-black animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2.5 hover:bg-white/10 rounded-xl transition text-white"
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
              className="overflow-hidden border-t border-white/5"
            >
              <form onSubmit={handleSearch} className="py-6 flex gap-4">
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="SEARCH FOR AESTHETIC PIECES..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold tracking-widest outline-none focus:border-pink-500 transition-all uppercase"
                />
                <button type="submit" className="bg-white text-black px-8 rounded-2xl font-black text-xs tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center gap-2">
                  FIND <ArrowRight size={14} />
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
              className="lg:hidden pb-8 border-t border-white/5"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-4 px-2 text-xs font-black tracking-[0.2em] text-gray-400 hover:text-pink-500 transition-all uppercase"
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
