"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Share2, ShoppingBag, ShoppingCart, Zap, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "@/context/cartContext"
import { ProductCard } from "@/components/product/ProductCard"
import { formatPrice } from "@/lib/utils/helpers"
import { mockProducts, categories } from "@/data/products"
import { notFound } from "next/navigation"

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = mockProducts.find((p) => p.slug === params.slug)

  if (!product) {
    notFound()
  }

  // Get related products from the same category
  const relatedProducts = mockProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  // Get category details for breadcrumb
  const category = categories.find((c) => c.id === product.categoryId)

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()
  const router = useRouter()

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                {product.images.map((image, index) => (
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
              Home / Shop / {category?.name || "All"} / {product.name}
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
                      -
                      {Math.round(
                        ((product.originalPrice - product.price) / product.originalPrice) * 100
                      )}
                      %
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

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Material
                </p>
                <p className="font-medium text-gray-900">Premium Quality</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Size</p>
                <p className="font-medium text-gray-900">Standard</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Stock</p>
                <p className="font-medium text-gray-900">{product.stock} units</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Style</p>
                <p className="font-medium text-gray-900">Minimalist Aesthetic</p>
              </div>
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

            {/* Go to Cart & Buy Now - shown after adding */}
            {isAdded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-4"
              >
                <button
                  onClick={() => router.push('/cart')}
                  className="flex-1 py-3 border-2 border-gray-800 text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Go to Cart
                </button>
                <button
                  onClick={() => router.push('/checkout')}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Zap size={20} />
                  Buy Now
                </button>
              </motion.div>
            )}

            {/* Wishlist & Share */}
            <div className="flex gap-2">
              <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Heart size={20} />
                Add to Wishlist
              </button>
              <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share
              </button>
            </div>

            {/* Delivery Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Free Shipping</span> on orders above ₹500
              </p>
              <p className="text-sm text-blue-900 mt-2">
                Estimated Delivery: <span className="font-semibold">3-5 business days</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="border-t border-b border-gray-200 mb-16">
          <div className="grid grid-cols-3 gap-0">
            {["Description", "Reviews", "Shipping"].map((tab) => (
              <button
                key={tab}
                className="py-4 px-6 text-center font-medium border-b-2 border-transparent hover:border-pink-400 transition"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-serif font-bold mb-8">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p as any} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
