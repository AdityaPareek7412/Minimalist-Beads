// app/cart/page.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/cartContext"
import { X, Plus, Minus, ArrowRight, Truck } from "lucide-react"
import { motion } from "framer-motion"
import { formatPrice } from "@/lib/utils/helpers"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const [settings, setSettings] = useState({ shippingFee: 50, freeShippingLimit: 500 })

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {})
  }, [])

  const subtotal = getCartTotal()
  const shipping = subtotal > settings.freeShippingLimit ? 0 : settings.shippingFee
  const total = subtotal + shipping

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center text-6xl">🛍️</div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg transition">
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
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cart.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className="p-6 border border-gray-200 rounded-xl hover:border-pink-200 transition">
                  <div className="flex gap-6">
                    <div className="relative w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] && <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.product?.slug}`} className="text-lg font-semibold text-gray-900 hover:text-pink-500 transition">{item.product?.name}</Link>
                      <p className="text-sm text-gray-500 mt-1">{formatPrice(item.product?.price || 0)} per item</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm">
                          <button onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-pink-100 transition font-bold text-lg"><Minus size={16} /></button>
                          <span className="w-12 h-10 flex items-center justify-center font-bold text-gray-900 bg-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-pink-100 transition font-bold text-lg"><Plus size={16} /></button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-xl font-bold text-gray-900">{formatPrice((item.product?.price || 0) * item.quantity)}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 transition"><X size={20} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-3xl p-8 sticky top-24 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-bold text-gray-900">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-bold" : "font-bold text-gray-900"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-black text-pink-600">{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/checkout" className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:bg-pink-700 transition-all text-center block mb-4">Proceed to Checkout</Link>
              
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <div className="flex items-center gap-2 text-pink-700 mb-1">
                  <Truck size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Shipping Info</span>
                </div>
                <p className="text-sm text-pink-600 font-medium">
                  {subtotal > settings.freeShippingLimit 
                    ? "🎉 You unlocked FREE shipping!" 
                    : `Add ${formatPrice(settings.freeShippingLimit - subtotal)} more for FREE shipping!`}
                </p>
                <p className="text-[10px] text-pink-400 mt-1">Free shipping on orders above {formatPrice(settings.freeShippingLimit)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
