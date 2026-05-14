// src/components/product/ProductCard.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types"
import { Heart, ShoppingBag, ShoppingCart, Plus, Minus } from "lucide-react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useCart } from "@/context/cartContext"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { calculateDiscount, formatPrice } from "@/lib/utils/helpers"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  
  // 3D Tilt Effect
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring" }}
      className="group relative perspective-1000"
      style={{ perspective: 1000 }}
    >
      <Link href={`/products/${product.slug}`}>
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative rounded-2xl overflow-hidden aspect-square cursor-pointer glass-card bg-white/5"
        >
          {/* Main Image */}
          {mainImage && (
            <motion.div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} className="w-full h-full relative z-0">
              <Image
                src={mainImage.url}
                alt={mainImage.alt || product.name}
                fill
                className="object-cover w-full h-full drop-shadow-2xl"
              />
            </motion.div>
          )}

          {/* Hover Image */}
          {isHovered && hoverImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ transform: "translateZ(60px)" }}
              className="absolute inset-0 z-10"
            >
              <Image
                src={hoverImage.url}
                alt={hoverImage.alt || product.name}
                fill
                className="object-cover w-full h-full drop-shadow-2xl"
              />
            </motion.div>
          )}

          {/* Badges */}
          <motion.div style={{ transform: "translateZ(80px)" }} className="absolute top-4 left-4 flex gap-2 z-20">
            {product.newArrival && (
              <span className="bg-pink-500/80 backdrop-blur text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                NEW
              </span>
            )}
            {product.trending && (
              <span className="bg-indigo-500/80 backdrop-blur text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                FIRE 🔥
              </span>
            )}
            {discount > 0 && (
              <span className="bg-fuchsia-500/80 backdrop-blur text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                -{discount}%
              </span>
            )}
          </motion.div>

          {/* Quick Actions on Hover - only show if NOT in cart */}
          {isHovered && product.stock > 0 && cartQty === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ transform: "translateZ(90px)" }}
              className="absolute bottom-4 left-4 right-4 flex gap-2 z-20"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="flex-1 bg-white text-black py-3 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-2 font-bold shadow-xl"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-xl hover:bg-white/30 transition flex items-center justify-center shadow-xl"
              >
                <Heart size={20} />
              </motion.button>
            </motion.div>
          )}

          {/* Persistent Quantity Controls - when item IS in cart */}
          {cartQty > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ transform: "translateZ(90px)" }}
              className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 z-20"
            >
              {/* Quantity Controls */}
              <div className="flex items-center justify-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDecrement}
                  className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-xl hover:bg-red-50 transition"
                >
                  <Minus size={16} />
                </motion.button>
                <span className="w-12 h-10 bg-white text-black rounded-xl flex items-center justify-center text-lg font-black shadow-xl">
                  {cartQty}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleIncrement}
                  className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-xl hover:bg-green-50 transition"
                >
                  <Plus size={16} />
                </motion.button>
              </div>
              {/* Go to Cart */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 font-bold shadow-xl"
              >
                <ShoppingCart size={16} />
                Go to Cart
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </Link>

      {/* Product Info */}
      <motion.div 
        className="mt-6 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-bold text-white truncate group-hover:text-pink-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-400 mt-1 truncate font-medium">{product.category?.name}</p>

        {/* Price */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through font-medium">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
