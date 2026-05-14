// app/order-confirmation/page.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, Package, ArrowRight, Copy, Check } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || ""
  const paymentId = searchParams.get("paymentId") || ""
  const amount = searchParams.get("amount") || "0"
  const method = searchParams.get("method") || "online"
  const [copied, setCopied] = useState(false)

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId || paymentId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 sm:p-12 text-center"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200"
        >
          <CheckCircle size={48} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-serif font-bold text-gray-900 mb-3"
        >
          {method === "cod" ? "Order Placed!" : "Payment Successful!"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8"
        >
          {method === "cod"
            ? "Your order has been placed. Pay when you receive it."
            : "Thank you for your purchase! Your order has been confirmed."}
        </motion.p>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4"
        >
          {(orderId || paymentId) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order ID</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold text-gray-900">
                  {(orderId || paymentId).slice(0, 20)}...
                </span>
                <button onClick={copyOrderId} className="text-gray-400 hover:text-pink-500 transition">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Amount Paid</span>
            <span className="text-lg font-bold text-pink-600">
              ₹{parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Payment Method</span>
            <span className="text-sm font-semibold text-gray-900">
              {method === "cod" ? "Cash on Delivery" : "Online Payment"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {method === "cod" ? "Confirmed" : "Paid"}
            </span>
          </div>
        </motion.div>

        {/* Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 mb-8"
        >
          <Package size={20} className="text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700 text-left">
            Your order will be shipped within <strong>2-3 business days</strong>. You'll receive tracking details via email/SMS.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <Link
            href="/shop"
            className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/"
            className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition block"
          >
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full"></div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
