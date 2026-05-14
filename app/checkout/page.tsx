// app/checkout/page.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, MapPin, Truck, Lock } from "lucide-react"
import { useCart } from "@/context/cartContext"
import { formatPrice } from "@/lib/utils/helpers"

export default function CheckoutPage() {
  const { cart, getCartTotal } = useCart()
  const [currentStep, setCurrentStep] = useState<"address" | "payment">("address")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  })
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "upi" | "cod">(
    "razorpay"
  )

  const subtotal = getCartTotal()
  const shipping = subtotal > 500 ? 0 : 50
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle payment processing
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { step: "address", label: "Address" },
              { step: "payment", label: "Payment" },
              { step: "confirm", label: "Confirm" },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === item.step || (index === 0 && currentStep)
                      ? "bg-pink-400 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </motion.div>
                <p className="ml-3 text-sm font-medium text-gray-700">{item.label}</p>
                {index < 2 && (
                  <div
                    className={`w-20 h-1 mx-4 ${
                      currentStep !== "address" && index === 0
                        ? "bg-pink-400"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === "address" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white"
              >
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin size={24} />
                  Shipping Address
                </h2>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  {/* City, State, Postal */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({ ...formData, postalCode: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Link
                      href="/cart"
                      className="flex-1 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition text-center"
                    >
                      Back to Cart
                    </Link>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg transition"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {currentStep === "payment" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white"
              >
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lock size={24} />
                  Payment Method
                </h2>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Razorpay */}
                  <label className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-400 transition"
                    onChange={() => setPaymentMethod("razorpay")}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === "razorpay"}
                        className="mt-1"
                      />
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">Razorpay</p>
                        <p className="text-sm text-gray-600">
                          Credit/Debit Card, Net Banking, Wallet
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* UPI */}
                  <label className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-400 transition"
                    onChange={() => setPaymentMethod("upi")}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        className="mt-1"
                      />
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">UPI</p>
                        <p className="text-sm text-gray-600">
                          Google Pay, PhonePe, PayTM, BHIM
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* COD */}
                  <label className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-400 transition"
                    onChange={() => setPaymentMethod("cod")}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        className="mt-1"
                      />
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">
                          Pay when you receive your order
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep("address")}
                      className="flex-1 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Back to Address
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg transition"
                    >
                      Place Order
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product?.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-pink-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                <Lock size={16} className="text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">
                  Secure checkout powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
