// src/components/product/ProductCard.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types"
import { Heart, ShoppingBag, ShoppingCart, Plus, Minus } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "@/context/cartContext"
import { useWishlist } from "@/context/wishlistContext"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { calculateDiscount, formatPrice } from "@/lib/utils/helpers"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  
  const discount = calculateDiscount(product.originalPrice || product.price, product.price)
  const mainImage = product.images?.[0]
  const hoverImage = product.images?.[1]

  // Check if product is already in cart and get its quantity
  const cartItem = cart.find((item) => item.productId === product.id)
  const cartQty = cartItem ? cartItem.quantity : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartQty <= 1) {
      removeFromCart(product.id)
    } else {
      updateQuantity(product.id, cartQty - 1)
    }
  }

  const handleGoToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push('/cart')
  }

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-pink-100/50 transition-all duration-300 ${product.stock === 0 ? 'grayscale-[0.5]' : ''}`}
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-pink-50/30">
        {/* Main Image */}
        {mainImage && (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            fill
            className={`object-cover transition-transform duration-700 ${product.stock === 0 ? 'opacity-40' : ''} ${isHovered && hoverImage && product.stock > 0 ? 'opacity-0' : 'opacity-100 scale-100 group-hover:scale-105'}`}
          />
        )}

        {/* Hover Image */}
        {hoverImage && product.stock > 0 && (
          <Image
            src={hoverImage.url}
            alt={hoverImage.alt || product.name}
            fill
            className={`object-cover transition-all duration-700 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.stock === 0 ? (
            <span className="bg-gray-900/90 backdrop-blur-sm text-white px-3 py-1 text-[10px] font-bold rounded-full shadow-lg uppercase tracking-widest border border-white/20">
              SOLD OUT
            </span>
          ) : (
            <>
              {product.newArrival && (
                <span className="bg-white/90 backdrop-blur-sm text-pink-500 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-sm border border-pink-100 uppercase tracking-wider">
                  NEW
                </span>
              )}
              {discount > 0 && (
                <span className="bg-pink-500 text-white px-2.5 py-1 text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wider">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button Overlay */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 z-10 shadow-sm border ${
            isInWishlist(product.id)
              ? 'bg-pink-500 border-pink-400 text-white'
              : 'bg-white/80 border-pink-100 text-gray-400 hover:text-pink-500'
          }`}
        >
          <Heart size={18} className={isInWishlist(product.id) ? "fill-current" : ""} />
        </button>

      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        <Link href={`/products/${product.slug}`} className="flex-grow">
          <h3 className={`font-sans font-semibold text-lg leading-tight group-hover:text-pink-500 transition-colors truncate ${product.stock === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
            {product.name}
          </h3>
          <p className="text-gray-400 text-xs mt-1 font-medium">{product.category?.name || "Handmade"}</p>
        </Link>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg ${product.stock === 0 ? 'text-gray-300' : 'text-pink-600'}`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 text-xs line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {product.stock === 0 ? (
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">
              SOLD
            </span>
          ) : product.stock <= 5 && (
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">
              Only {product.stock} left!
            </span>
          )}
        </div>

        {/* Always Visible Add to Cart Button Section */}
        <div className="mt-4 pt-3 border-t border-pink-50/50">
          {product.stock === 0 ? (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed text-center"
            >
              Out of Stock
            </button>
          ) : cartQty > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center bg-pink-50/50 rounded-xl border border-pink-100 p-0.5 flex-1">
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-100 text-pink-600 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="flex-1 text-center font-bold text-xs text-gray-800">{cartQty}</span>
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-100 text-pink-600 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
              <button
                onClick={handleGoToCart}
                className="bg-pink-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-pink-700 transition-colors shadow-sm flex items-center gap-1"
              >
                Cart <ShoppingCart size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-900 hover:bg-pink-600 text-white py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag size={14} />
              ADD TO CART
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
