"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Share2, ShoppingBag, Minus, Plus, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "@/context/cartContext"
import { useWishlist } from "@/context/wishlistContext"
import { ProductCard } from "@/components/product/ProductCard"
import { formatPrice, getImageUrl } from "@/lib/utils/helpers"

export default function ProductDetailsClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  )
  const { addToCart, cart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const router = useRouter()

  const displayPrice = selectedVariant?.price ?? product.price
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock
  const hasVariants = product.variants && product.variants.length > 0

  const cartItem = cart.find(
    (item) => item.productId === product.id && item.selectedVariant?.id === selectedVariant?.id
  )
  const cartQty = cartItem ? cartItem.quantity : 0
  const remainingStock = Math.max(0, displayStock - cartQty)

  // Reset selected quantity when variant changes
  useState(() => {
    // Note: We can also run an effect or just handle it directly on render or variant change
  })

  // Reset quantity when variant changes to ensure it's not out of bounds
  useState(() => {
    // using useEffect is better, we'll define it below
  })

  const handleAddToCart = () => {
    if (remainingStock <= 0) {
      alert("All available stock is already in your bag.")
      return
    }
    const qtyToUse = Math.min(quantity, remainingStock)
    addToCart(product, qtyToUse, selectedVariant || undefined)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  // Reset quantity on variant change
  useState(() => {
    // We will do a React.useEffect below
  })

  // We add standard useEffect at component level
  const [lastVariantId, setLastVariantId] = useState(selectedVariant?.id)
  if (selectedVariant?.id !== lastVariantId) {
    setLastVariantId(selectedVariant?.id)
    setQuantity(1)
  }

  return (
    <div className="min-h-screen bg-[#fdf0f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-900">
        {/* Breadcrumb */}
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
          <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-pink-500 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20 bg-white p-6 sm:p-10 rounded-[2rem] shadow-sm border border-pink-100">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="mb-6">
              <div className="relative bg-pink-50/30 rounded-2xl overflow-hidden aspect-square border border-pink-100/50 shadow-inner">
                <Image
                  src={getImageUrl(product.images[selectedImage]?.url)}
                  alt={product.images[selectedImage]?.alt || product.name}
                  fill
                  className="object-cover transition-transform duration-500"
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
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      index === selectedImage
                        ? "border-pink-500 shadow-md scale-105"
                        : "border-pink-50 hover:border-pink-200 grayscale-[0.2] hover:grayscale-0"
                    }`}
                  >
                    <Image
                      src={getImageUrl(image.url)}
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Badges */}
            <div className="flex gap-2 mb-6">
              {displayStock === 0 ? (
                <span className="bg-gray-900 text-white px-4 py-1.5 text-[10px] font-bold rounded-full shadow-lg tracking-[0.2em] border border-white/10 uppercase">
                  OUT OF STOCK
                </span>
              ) : (
                <>
                  {product.newArrival && (
                    <span className="bg-pink-500 text-white px-3 py-1 text-[10px] font-bold rounded-full shadow-sm tracking-wider">
                      NEW ARRIVAL
                    </span>
                  )}
                  {product.trending && (
                    <span className="bg-emerald-600 text-white px-3 py-1 text-[10px] font-bold rounded-full shadow-sm tracking-wider">
                      TRENDING NOW
                    </span>
                  )}
                </>
              )}
            </div>

            <h1 className={`text-4xl sm:text-5xl font-sans font-bold mb-4 leading-tight tracking-tight ${displayStock === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-pink-50">
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${displayStock === 0 ? 'text-gray-300' : 'text-pink-600'}`}>
                  {formatPrice(displayPrice)}
                </span>
                {product.originalPrice && product.originalPrice > displayPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > displayPrice && displayStock > 0 && (
                <span className="bg-pink-100 text-pink-500 px-2 py-0.5 rounded-lg text-sm font-bold">
                  SAVE {Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed font-light">
              <p>{product.description}</p>
            </div>

            {/* Product Variants (Colors/Styles) */}
            {hasVariants && (
              <div className="mb-8 bg-pink-50/20 p-5 rounded-2xl border border-pink-100/50">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Select Option/Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const variantPrice = variant.price ?? product.price;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-200 scale-105"
                            : "bg-white border-pink-100 text-gray-700 hover:border-pink-300 hover:bg-pink-50/30"
                        }`}
                      >
                        {variant.name}
                        {variant.price && variant.price !== product.price && (
                          <span className={`ml-1.5 text-[10px] font-normal ${isSelected ? 'text-pink-100' : 'text-pink-500'}`}>
                            ({formatPrice(variant.price)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock & Features */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${displayStock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-bold uppercase tracking-wider ${displayStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {displayStock > 0 ? `In Stock (${displayStock} available)` : 'Sold Out / Unavailable'}
                </span>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  Handmade
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  Aesthetic Curation
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className={`flex items-center bg-pink-50/50 border border-pink-100 rounded-full p-1.5 shadow-inner ${displayStock === 0 || remainingStock === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-pink-100 text-gray-600 transition-all border border-pink-100 shadow-sm"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-lg font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                  disabled={quantity >= remainingStock}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all border border-pink-100 shadow-sm ${quantity >= remainingStock ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'bg-white hover:bg-pink-100 text-gray-600'}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={displayStock === 0 || remainingStock === 0}
                className={`flex-1 py-4 px-8 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg hover:shadow-pink-200 flex items-center justify-center gap-3 ${
                  displayStock === 0 || remainingStock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    : isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-900 text-white hover:bg-pink-600"
                }`}
              >
                <ShoppingBag size={18} />
                {displayStock === 0 ? "SOLD OUT" : remainingStock === 0 ? "ALL IN BAG" : isAdded ? "ADDED TO BAG" : "ADD TO BAG"}
              </button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-3">
              <button 
                onClick={toggleWishlist}
                className={`flex-1 py-3.5 px-6 border rounded-full font-bold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                  isInWishlist(product.id) 
                    ? 'bg-pink-50 border-pink-200 text-pink-500' 
                    : 'bg-white border-pink-100 text-gray-500 hover:border-pink-300 hover:text-pink-500'
                }`}
              >
                <Heart size={16} className={isInWishlist(product.id) ? "fill-current" : ""} />
                {isInWishlist(product.id) ? "SAVED IN WISHES" : "ADD TO WISHLIST"}
              </button>
              <button className="p-3.5 border border-pink-100 bg-white text-gray-500 hover:text-pink-500 rounded-full transition-all duration-300">
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-serif font-bold text-gray-900">You Might Also Love</h2>
              <Link href="/shop" className="text-xs font-bold text-pink-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
                View All Collection →
              </Link>
            </div>
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
