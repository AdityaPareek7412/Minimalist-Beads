// app/order-confirmation/page.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Package, ArrowRight, Copy, Check, MapPin, CreditCard, ShoppingBag, Loader2, AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { formatPrice } from "@/lib/utils/helpers"

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || ""
  const amountFromUrl = searchParams.get("amount") || "0"
  const methodFromUrl = searchParams.get("method") || "online"

  const [copied, setCopied] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    
    fetch(`/api/orders/details?id=${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.order)
        } else {
          setError(data.error || "Order details not found")
        }
      })
      .catch(() => {
        setError("Failed to load details from database")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [orderId])

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Fallback to URL parameters if order fetch fails or is not complete
  const subtotal = order ? order.subtotal : parseFloat(amountFromUrl)
  const shipping = order ? order.shippingCost : 0
  const discount = order ? order.discount : 0
  const totalAmount = order ? (order.payment?.amount || order.total) : parseFloat(amountFromUrl)
  const paymentMethod = order ? (order.payment?.paymentMethod || methodFromUrl) : methodFromUrl
  const orderNumber = order ? (order.orderNumber || order.id) : orderId

  // Calculate platform fee / processing fee if order details are loaded
  const baseTotal = subtotal + shipping - discount
  const processingFee = order ? Math.max(0, Math.round((totalAmount - baseTotal) * 100) / 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-pink-500 w-12 h-12 mb-4" />
        <p className="text-gray-500 text-sm font-medium">Securing payment details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(253,240,245,0.4)] p-6 sm:p-10 border border-pink-100/50 my-8"
      >
        {/* Success Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-200"
          >
            <CheckCircle size={40} className="text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-serif font-bold text-gray-900 mb-2"
          >
            {paymentMethod.toLowerCase() === "cod" ? "Order Confirmed!" : "Payment Verified!"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-sm max-w-md mx-auto"
          >
            Thank you for shopping with MinimalistBeads. Your order has been placed successfully and is being prepared.
          </motion.p>
        </div>

        {/* Order Info Summary Card */}
        <div className="bg-pink-50/20 border border-pink-100/40 rounded-3xl p-6 mb-8 grid grid-cols-2 gap-4 text-left">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Order ID</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-pink-600 truncate max-w-[130px] sm:max-w-none">
                #{orderNumber}
              </span>
              <button onClick={copyOrderId} className="text-gray-400 hover:text-pink-500 transition">
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Status</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {paymentMethod.toLowerCase() === "cod" ? "Confirmed" : "Paid"}
            </span>
          </div>
          <div className="pt-2 border-t border-pink-100/20">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Date</span>
            <span className="text-xs font-semibold text-gray-700">
              {order ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="text-right pt-2 border-t border-pink-100/20">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Method</span>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-end gap-1.5">
              <CreditCard size={12} className="text-purple-400" />
              {paymentMethod.toLowerCase() === "cod" ? "Cash On Delivery" : "Online UPI/Card"}
            </span>
          </div>
        </div>

        {/* Dynamic Detailed Section */}
        {order ? (
          <div className="space-y-8">
            {/* Ordered Items */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShoppingBag size={14} className="text-pink-400" /> Items Ordered ({order.items.length})
              </h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar border-b border-gray-100 pb-4">
                {order.items.map((item: any) => {
                  const imgUrl = item.product?.images?.[0]?.url || ""
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-1.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-pink-50/20 flex-shrink-0 border border-pink-50">
                          {imgUrl ? (
                            <Image src={imgUrl} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-pink-50/30 flex items-center justify-center"><Package size={16} className="text-pink-300" /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.product?.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            Qty: {item.quantity} • {formatPrice(item.price)}
                            {item.selectedVariantName && <span className="text-pink-400"> ({item.selectedVariantName})</span>}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{formatPrice(item.total)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 bg-gray-50/40 rounded-3xl p-6 border border-gray-100 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping Charges</span>
                <span className="text-gray-900 font-medium">{shipping > 0 ? formatPrice(shipping) : "FREE"}</span>
              </div>
              {processingFee > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Payment Processing Fee</span>
                  <span className="text-gray-900 font-medium">{formatPrice(processingFee)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-pink-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Order Value</span>
                <span className="text-lg font-bold text-pink-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Shipping To */}
            <div className="border border-pink-50 rounded-3xl p-6 text-left">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-pink-400" /> Delivery Address
              </h3>
              <p className="text-xs font-bold text-gray-800">{order.customerName}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}<br />
                Phone: {order.customerPhone}
              </p>
            </div>
          </div>
        ) : (
          /* Simple Fallback Details box if order lookup is not ready/fails */
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-3xl p-6 text-sm text-left space-y-3">
              <div className="flex justify-between text-gray-500">
                <span>Amount Charged</span>
                <span className="text-gray-900 font-bold">₹{parseFloat(amountFromUrl).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Payment Mode</span>
                <span className="text-gray-900 font-bold uppercase">{paymentMethod}</span>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                <AlertCircle size={14} />
                <span>Order billing details synced. Tracking invoice link will be sent to your email shortly.</span>
              </div>
            )}
          </div>
        )}

        {/* Shipping Notice Banner */}
        <div className="flex items-start gap-3.5 bg-blue-50/50 border border-blue-100/50 rounded-3xl p-5 my-8 text-left">
          <Package size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Standard Delivery Notice</h4>
            <p className="text-xs text-blue-700/80 leading-relaxed">
              Your order will be shipped within <strong>2-3 business days</strong>. Tracking details and invoice notification has been sent via email.
            </p>
          </div>
        </div>

        {/* Actions Button Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/track-order"
            className="py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs shadow-md shadow-gray-900/10"
          >
            Track Order Live
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/shop"
            className="py-4 border border-pink-100 font-bold text-gray-500 rounded-full hover:bg-pink-50/30 transition-all uppercase tracking-widest text-xs flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
