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
  // Ensure background is pink-toned, never solid white
  const headerBg = useTransform(scrollY, [0, 50], ["rgba(253, 240, 245, 0)", "rgba(253, 240, 245, 0.6)"])
  const headerBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(24px)"])

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

  const iconContainerClass = "w-10 h-10 flex items-center justify-center bg-white/30 backdrop-blur-md rounded-full transition-all duration-300 group-hover:bg-white/60 group-hover:shadow-lg group-hover:shadow-pink-200/50 group-hover:-translate-y-0.5 border border-white/40"
  const iconClass = "text-gray-600 group-hover:text-pink-500 transition-colors duration-300"

  return (
    <motion.header 
      style={{ backgroundColor: headerBg, backdropFilter: headerBlur }}
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'border-b border-white/20 shadow-[0_4px_30px_rgba(253,240,245,0.1)]' : 'border-b border-transparent'}`}
    >
      {settings?.announcement && (
        <div className="relative overflow-hidden bg-white/5 h-8 flex items-center border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-300/10 via-pink-300/10 to-rose-300/10 animate-gradient-x" />
          <div className="relative w-full overflow-hidden whitespace-nowrap">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center gap-20"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span className="text-[8px] font-bold text-gray-500/50 uppercase tracking-[0.5em] flex items-center gap-3">
                    <span className="w-1 h-1 bg-pink-200 rounded-full" />
                    {settings.announcement}
                    <span className="w-1 h-1 bg-pink-200 rounded-full" />
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Hamburger Menu Button */}
            <button
              className="group p-2 flex items-center justify-center hover:bg-white/40 rounded-full transition-all duration-300"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={1.5} className="text-gray-600 group-hover:text-pink-500" />
            </button>

            {/* Logo & Brand Name */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-full border border-white/80 group-hover:border-pink-300 transition-all duration-700 shadow-sm ring-4 ring-pink-50/5">
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
              <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-gray-800 sm:inline hidden group-hover:text-pink-500 transition-all duration-500">
                MinimalistBeads
              </span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="group relative"
            >
              <div className={iconContainerClass}>
                <Search size={18} strokeWidth={1.5} className={iconClass} />
              </div>
            </button>
            
            <Link href="/wishlist" className="group relative">
              <div className={iconContainerClass}>
                <Heart size={18} strokeWidth={1.5} className={iconClass} />
              </div>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-[#fdf0f5]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="group relative">
              <div className={iconContainerClass}>
                <ShoppingBag size={18} strokeWidth={1.5} className={iconClass} />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-[#fdf0f5]">
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
              className="overflow-hidden py-4 px-2"
            >
              <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto relative group">
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="What are you dreaming of?..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full px-7 py-3.5 text-gray-800 text-xs font-medium outline-none focus:border-pink-300 focus:bg-white/60 placeholder-gray-400 transition-all shadow-sm"
                />
                <button type="submit" className="bg-gray-800 text-white px-8 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-pink-500 transition-all flex items-center gap-2 shadow-xl shadow-gray-200/20">
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
