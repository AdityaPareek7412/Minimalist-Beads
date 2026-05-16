"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useCart } from "@/context/cartContext"
import { useWishlist } from "@/context/wishlistContext"
import { Heart, ShoppingBag, Search, Menu, X, ArrowRight } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { MobileMenu } from "./MobileMenu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [settings, setSettings] = useState<any>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const { scrollY } = useScroll()
  const headerBg = useTransform(scrollY, [0, 50], ["rgba(253, 240, 245, 0)", "rgba(255, 255, 255, 0.4)"])
  const headerBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(20px)"])

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", updateScroll)
    return () => window.removeEventListener("scroll", updateScroll)
  }, [])
  
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

  const iconClass = "text-gray-500 group-hover:text-pink-500 transition-all duration-300 transform group-hover:-translate-y-0.5"

  return (
    <motion.header 
      style={{ backgroundColor: headerBg, backdropFilter: headerBlur }}
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'border-b border-white/20 shadow-sm' : 'border-b border-transparent'}`}
    >
      {settings?.announcement && (
        <div className="relative overflow-hidden bg-white/10 h-8 flex items-center border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 via-pink-400/20 to-rose-400/20 animate-gradient-x" />
          <div className="relative w-full overflow-hidden whitespace-nowrap py-1">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center gap-20"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span className="text-[9px] font-bold text-gray-600/60 uppercase tracking-[0.4em] flex items-center gap-3">
                    <span className="w-1 h-1 bg-pink-300 rounded-full animate-pulse" />
                    {settings.announcement}
                    <span className="w-1 h-1 bg-pink-300 rounded-full animate-pulse" />
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Hamburger Menu Button */}
            <button
              className="p-2 hover:bg-white/40 rounded-full transition-all text-gray-600 group"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={22} strokeWidth={1.5} className="group-hover:text-pink-500" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-full border border-white/60 group-hover:border-pink-300 transition-all duration-700 shadow-sm ring-4 ring-pink-50/10">
                <img 
                  src="/images/logo.png" 
                  alt="Logo" 
                  className="object-cover w-full h-full scale-90 group-hover:scale-100 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-pink-100', 'to-rose-100');
                  }}
                />
              </div>
              <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-gray-800 sm:inline hidden group-hover:text-pink-500 transition-colors duration-500">
                MinimalistBeads
              </span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2.5 hover:bg-white/40 rounded-full transition-all group"
            >
              <Search size={18} strokeWidth={1.5} className={iconClass} />
            </button>
            
            <Link href="/wishlist" className="p-2.5 hover:bg-white/40 rounded-full transition-all relative group">
              <Heart size={18} strokeWidth={1.5} className={iconClass} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-pink-400 text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="p-2.5 hover:bg-white/40 rounded-full transition-all relative group">
              <ShoppingBag size={18} strokeWidth={1.5} className={iconClass} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-gray-800 text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="overflow-hidden py-4"
            >
              <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="What are you dreaming of?..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/40 backdrop-blur-md border border-white/60 rounded-full px-6 py-3 text-gray-800 text-xs font-medium outline-none focus:border-pink-300 placeholder-gray-400 transition-all"
                />
                <button type="submit" className="bg-gray-800 text-white px-8 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-all flex items-center gap-2 shadow-lg shadow-gray-200/50">
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* LUXURY MOBILE SIDEBAR */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </motion.header>
  )
}
