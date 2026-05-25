// app/cart/page.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/cartContext"
import { X, Plus, Minus, ArrowRight, Truck, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils/helpers"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const [settings, setSettings] = useState({ shippingFee: 80, freeShippingLimit: 0 })

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => { })
  }, [])

  const subtotal = getCartTotal()
  const shipping = settings.shippingFee
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-[#fdf0f5] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Your Shopping Bag</h1>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
            {cart.length === 0 ? "Empty bag" : `${cart.length} items ready for you`}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-pink-100 shadow-sm">
            <div className="text-6xl mb-6 opacity-20">🛍️</div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Your bag is lonely</h2>
            <p className="text-gray-400 mb-10 max-w-xs mx-auto">Add some Charms magic to your collection and make it smile.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg"
            >
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item) => {
                  const itemPrice = item.selectedVariant?.price ?? item.product?.price ?? 0;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-pink-50/30 flex-shrink-0 border border-pink-100">
                        <Image
                          src={item.product?.images?.[0]?.url || ""}
                          alt={item.product?.name || ""}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-sans font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                          {item.product?.name}
                        </h3>
                        {item.selectedVariant && (
                          <span className="inline-block mt-1.5 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-bold font-mono">
                            Color/Variant: {item.selectedVariant.name}
                          </span>
                        )}
                        <p className="text-pink-600 font-bold mt-1">{formatPrice(itemPrice)}</p>
                      </div>

                      <div className="flex items-center bg-pink-50/50 border border-pink-100 rounded-full p-1 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-pink-100 text-gray-600 transition-all shadow-sm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-pink-100 text-gray-600 transition-all shadow-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-center sm:text-right min-w-[100px]">
                        <p className="text-gray-900 font-bold mb-2">{formatPrice(itemPrice * item.quantity)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[2rem] border border-pink-100 shadow-sm sticky top-28">
                <h2 className="text-xl font-serif font-bold text-gray-900 mb-8 pb-4 border-b border-pink-50 uppercase tracking-widest text-center">Bag Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900 font-bold">
                      {formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-pink-50 flex justify-between items-center">
                    <span className="text-lg font-serif font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-pink-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-gray-900 text-white py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-pink-600 transition-all shadow-lg hover:shadow-pink-200 text-center"
                >
                  Checkout Now <ArrowRight size={18} />
                </Link>

                <p className="mt-6 text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
                  ✨ Secure Checkout & Fast Delivery
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
