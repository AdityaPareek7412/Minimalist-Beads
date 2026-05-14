// app/cart/page.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/cartContext"
import { X, Plus, Minus, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { formatPrice } from "@/lib/utils/helpers"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart()

  const subtotal = getCartTotal()
  const shipping = subtotal > 500 ? 0 : 50
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center text-6xl">
            🛍️
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items yet.
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
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border border-gray-200 rounded-xl hover:border-pink-200 transition"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] && (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product?.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-pink-500 transition"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatPrice(item.product?.price || 0)} per item
                      </p>

                      {/* Quantity Controls - Big & Visible */}
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-sm font-semibold text-gray-700">Qty:</span>
                        <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, Math.max(0, item.quantity - 1))
                            }
                            className="w-11 h-11 flex items-center justify-center bg-gray-100 hover:bg-pink-100 hover:text-pink-600 transition font-bold text-lg border-r-2 border-gray-300"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="w-16 h-11 flex items-center justify-center text-xl font-black text-gray-900 bg-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-11 h-11 flex items-center justify-center bg-gray-100 hover:bg-pink-100 hover:text-pink-600 transition font-bold text-lg border-l-2 border-gray-300"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700 transition flex items-center gap-1 text-sm font-medium"
                      >
                        <X size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>GST (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                {/* Coupon */}
                <div className="pt-4 border-t border-gray-200">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button className="w-full mt-2 px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                    Apply Coupon
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-pink-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg transition text-center block"
              >
                Proceed to Checkout
              </Link>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="w-full mt-3 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition text-center block"
              >
                Continue Shopping
              </Link>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center mt-6">
                Free shipping on orders above ₹500
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
