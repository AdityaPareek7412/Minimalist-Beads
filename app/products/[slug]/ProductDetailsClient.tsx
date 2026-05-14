"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Heart, Share2, ShoppingBag, ShoppingCart, Zap, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "@/context/cartContext"
import { useWishlist } from "@/context/wishlistContext"
import { ProductCard } from "@/components/product/ProductCard"
import { formatPrice } from "@/lib/utils/helpers"

export default function ProductDetailsClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const router = useRouter()

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-900">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                <Image
                  src={product.images[selectedImage]?.url || ""}
                  alt={product.images[selectedImage]?.alt || product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                      index === selectedImage
                        ? "border-pink-400"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">
              Home / Shop / {product.category?.name || "All"} / {product.name}
            </div>

            {/* Title & Badges */}
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                {product.newArrival && (
                  <span className="bg-pink-100 text-pink-600 px-3 py-1 text-xs font-semibold rounded-full">
                    NEW
                  </span>
                )}
                {product.trending && (
                  <span className="bg-purple-100 text-purple-600 px-3 py-1 text-xs font-semibold rounded-full">
                    TRENDING
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">({Math.floor(Math.random() * 200 + 50)} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-lg font-semibold text-orange-400">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6 flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">In Stock</span>
                  {product.stock < 10 && (
                    <span className="text-xs text-orange-600">Only {product.stock} left!</span>
                  )}
                </>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-pink-100 hover:text-pink-600 transition font-bold text-lg border-r-2 border-gray-300"
                >
                  −
                </button>
                <span className="w-16 h-12 flex items-center justify-center text-xl font-black text-gray-900 bg-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-pink-100 hover:text-pink-600 transition font-bold text-lg border-l-2 border-gray-300"
                >
                  +
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  isAdded
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:shadow-lg"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ShoppingBag size={20} />
                {isAdded ? "Added to Cart!" : "Add to Cart"}
              </motion.button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (isInWishlist(product.id)) {
                    removeFromWishlist(product.id)
                  } else {
                    addToWishlist(product)
                  }
                }}
                className={`flex-1 py-3 border ${isInWishlist(product.id) ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-300 text-gray-900'} rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2`}
              >
                <Heart size={20} className={isInWishlist(product.id) ? "fill-current text-red-500" : ""} />
                {isInWishlist(product.id) ? "Saved" : "Add to Wishlist"}
              </button>
              <button className="flex-1 py-3 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
