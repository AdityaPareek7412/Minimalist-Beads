// src/components/common/Header.tsx

"use client"

import Link from "next/link"
import { useState } from "react"
import { useCart } from "@/context/cartContext"
import { useWishlist } from "@/context/wishlistContext"
import { Heart, ShoppingBag, Search, Menu, X } from "lucide-react"
import { motion } from "framer-motion"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { getCartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const cartCount = getCartCount()
  const wishlistCount = wishlistItems.length

  const navItems = [
    { name: "RESIN ART", href: "/shop?category=resin-art" },
    { name: "AESTHETIC RINGS", href: "/shop?category=rings" },
    { name: "HANDMADE", href: "/shop?category=handmade" },
    { name: "LIMITED DROPS", href: "/shop?category=limited" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-transparent group-hover:border-pink-400 transition-all duration-300 shadow-lg">
              <img 
                src="/images/logo.png" 
                alt="MinimalistBeads Logo" 
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Fallback if logo is not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-purple-400', 'to-pink-400');
                }}
              />
            </div>
            <span className="text-xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 hidden sm:inline group-hover:from-pink-400 group-hover:to-fuchsia-400 transition-all duration-300">
              MinimalistBeads
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium tracking-wide text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition">
              <Search size={20} className="text-gray-300 hover:text-white" />
            </button>
            <Link href="/wishlist" className="p-2 hover:bg-white/10 rounded-lg transition relative">
              <Heart size={20} className="text-gray-300 hover:text-white" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="p-2 hover:bg-white/10 rounded-lg transition relative">
              <ShoppingBag size={20} className="text-gray-300 hover:text-white" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-pink-400 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden pb-4 border-t border-white/10 bg-black/90 backdrop-blur-md"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 px-4 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </motion.nav>
        )}
      </div>
    </header>
  )
}
