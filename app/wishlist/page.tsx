"use client"

import Link from "next/link"
import Image from "next/image"
import { useWishlist } from "@/context/wishlistContext"
import { Trash2, ShoppingBag, Heart, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/context/cartContext"
import { formatPrice } from "@/lib/utils/helpers"

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  return (
    <div className="min-h-screen bg-[#fdf0f5] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Your Wishlist</h1>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
            {wishlistItems.length === 0 ? "No saved wishes" : `${wishlistItems.length} items you love`}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-pink-100 shadow-sm">
            <div className="text-6xl mb-6 opacity-20">✨</div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Wishes pending...</h2>
            <p className="text-gray-400 mb-10 max-w-xs mx-auto">Start exploring our collection and save the pieces that speak to you.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg"
            >
              Start Exploring <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlistItems.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-pink-50 transition-all duration-300"
                >
                  <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-pink-50/30">
                    <Image
                      src={product.images?.[0]?.url || ""}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </Link>
                  
                  <div className="p-5">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-lg font-serif font-bold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-pink-600 font-bold mt-2">{formatPrice(product.price)}</p>
                    
                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => {
                          addToCart(product, 1)
                          removeFromWishlist(product.id)
                        }}
                        className="flex-1 bg-gray-900 text-white py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={14} /> Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 text-pink-400 hover:bg-pink-100 hover:text-pink-600 transition-all border border-pink-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
