"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ArrowRight, ShoppingBag, Trash2 } from "lucide-react"
import { useWishlist } from "@/context/wishlistContext"
import { ProductCard } from "@/components/product/ProductCard"

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist()

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center text-6xl">
            <Heart size={64} className="text-gray-300" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Your Wishlist is Empty
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">
            Add your favorite items to your wishlist and find them easily later.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg transition"
          >
            Continue Shopping
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <Heart size={32} className="text-pink-400 fill-current" />
            My Wishlist
          </h1>
          <span className="text-gray-500 font-medium">
            {wishlistItems.length} items saved
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product, index) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} index={index} />
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all z-20"
                title="Remove from wishlist"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
