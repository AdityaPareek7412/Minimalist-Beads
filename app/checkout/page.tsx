// app/checkout/page.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, MapPin, Truck, Lock, ChevronDown, CreditCard, Loader2 } from "lucide-react"
import { useCart } from "@/context/cartContext"
import { formatPrice } from "@/lib/utils/helpers"

declare global {
  interface Window {
    Razorpay: any
  }
}

const countries = [
  { code: '+91', country: 'in', name: 'India' },
  { code: '+1', country: 'us', name: 'United States' },
  { code: '+44', country: 'gb', name: 'United Kingdom' },
  { code: '+61', country: 'au', name: 'Australia' },
  { code: '+971', country: 'ae', name: 'UAE' },
  { code: '+65', country: 'sg', name: 'Singapore' },
  { code: '+81', country: 'jp', name: 'Japan' },
  { code: '+49', country: 'de', name: 'Germany' },
  { code: '+33', country: 'fr', name: 'France' },
  { code: '+86', country: 'cn', name: 'China' },
  { code: '+977', country: 'np', name: 'Nepal' },
  { code: '+880', country: 'bd', name: 'Bangladesh' },
  { code: '+94', country: 'lk', name: 'Sri Lanka' },
  { code: '+92', country: 'pk', name: 'Pakistan' },
]

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"address" | "payment">("address")
  const [showDropdown, setShowDropdown] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    countryCode: "+91", street: "", city: "", state: "",
    postalCode: "", country: "India",
  })
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay")

  const subtotal = getCartTotal()
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + shipping

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = "Enter a valid 10-digit phone number"
    if (!formData.street.trim()) newErrors.street = "Street address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required"
    else if (formData.postalCode.replace(/\D/g, '').length < 6) newErrors.postalCode = "Enter a valid 6-digit pincode"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) setCurrentStep("payment")
  }

  const initiateRazorpay = async () => {
    setIsProcessing(true)
    try {
      // Create order on server
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          receipt: `order_${Date.now()}`,
          notes: {
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: `${formData.countryCode}${formData.phone}`,
          },
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Minimalist Beads",
        description: "Handcrafted Jewelry & Accessories",
        order_id: data.order.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            clearCart()
            router.push(
              `/order-confirmation?orderId=${response.razorpay_order_id}&paymentId=${response.razorpay_payment_id}&amount=${total}&method=online`
            )
          } else {
            alert("Payment verification failed. Please contact support.")
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: `${formData.countryCode}${formData.phone}`,
        },
        theme: { color: "#f472b6" },
        modal: {
          ondismiss: function () { setIsProcessing(false) },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", function () {
        alert("Payment failed. Please try again.")
        setIsProcessing(false)
      })
      rzp.open()
    } catch (error: any) {
      console.error("Payment error:", error)
      alert("Error: " + (error.message || "Something went wrong. Please try again."))
      setIsProcessing(false)
    }
  }

  const handleCOD = () => {
    setIsProcessing(true)
    clearCart()
    router.push(`/order-confirmation?orderId=COD_${Date.now()}&amount=${total}&method=cod`)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === "razorpay") initiateRazorpay()
    else handleCOD()
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border-2 rounded-xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-4 focus:ring-pink-500/20 text-gray-900 bg-gray-50 hover:bg-white focus:bg-white transition-all duration-300 placeholder-gray-400 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-pink-400 hover:border-gray-300'
    }`

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
                  <div className={`w-20 h-1 mx-4 ${currentStep !== "address" && index === 0 ? "bg-pink-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === "address" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin size={24} /> Shipping Address
                </h2>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">First Name <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="Enter first name" value={formData.firstName}
                        onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); if (errors.firstName) setErrors({...errors, firstName: ''}) }}
                        className={inputClass("firstName")} />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="Enter last name" value={formData.lastName}
                        onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); if (errors.lastName) setErrors({...errors, lastName: ''}) }}
                        className={inputClass("lastName")} />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Email <span className="text-red-500">*</span></label>
                      <input type="email" required placeholder="yourname@email.com" value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({...errors, email: ''}) }}
                        className={inputClass("email")} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Phone <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <div className="relative" ref={dropdownRef}>
                          <div onClick={() => setShowDropdown(!showDropdown)}
                            className="w-[110px] h-full px-3 py-3 border-2 border-gray-200 rounded-xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.08)] text-gray-900 bg-gray-50 hover:bg-white transition-all duration-300 text-sm cursor-pointer flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={`https://flagcdn.com/w20/${countries.find(c => c.code === formData.countryCode)?.country || 'in'}.png`} alt="flag" className="w-5 h-auto rounded-[2px] shadow-sm" />
                              <span className="font-medium">{formData.countryCode}</span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                          </div>
                          {showDropdown && (
                            <div className="absolute z-50 mt-2 w-[220px] bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] max-h-60 overflow-y-auto py-2">
                              {countries.map((c) => (
                                <div key={c.code} onClick={() => { setFormData({ ...formData, countryCode: c.code }); setShowDropdown(false) }}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-pink-50 cursor-pointer transition-colors">
                                  <img src={`https://flagcdn.com/w20/${c.country}.png`} alt={c.name} className="w-5 h-auto rounded-[2px] shadow-sm" />
                                  <span className="text-sm font-medium text-gray-900 w-10">{c.code}</span>
                                  <span className="text-xs text-gray-500 truncate">{c.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <input type="tel" required placeholder="10-digit number" value={formData.phone}
                          onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if (errors.phone) setErrors({...errors, phone: ''}) }}
                          className={`flex-1 px-4 py-3 border-2 rounded-xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-4 focus:ring-pink-500/20 text-gray-900 bg-gray-50 hover:bg-white focus:bg-white transition-all duration-300 placeholder-gray-400 ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-pink-400 hover:border-gray-300'}`} />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Street Address <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="House no, Building, Street, Area" value={formData.street}
                      onChange={(e) => { setFormData({ ...formData, street: e.target.value }); if (errors.street) setErrors({...errors, street: ''}) }}
                      className={inputClass("street")} />
                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">City <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="City" value={formData.city}
                        onChange={(e) => { setFormData({ ...formData, city: e.target.value }); if (errors.city) setErrors({...errors, city: ''}) }}
                        className={inputClass("city")} />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">State <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="State" value={formData.state}
                        onChange={(e) => { setFormData({ ...formData, state: e.target.value }); if (errors.state) setErrors({...errors, state: ''}) }}
                        className={inputClass("state")} />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Pin Code <span className="text-red-500">*</span></label>
                      <input type="text" required placeholder="6-digit" value={formData.postalCode}
                        onChange={(e) => { setFormData({ ...formData, postalCode: e.target.value }); if (errors.postalCode) setErrors({...errors, postalCode: ''}) }}
                        className={inputClass("postalCode")} />
                      {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Link href="/cart" className="flex-1 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition text-center">
                      Back to Cart
                    </Link>
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg transition">
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {currentStep === "payment" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lock size={24} /> Payment Method
                </h2>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Razorpay */}
                  <label className={`p-4 border-2 rounded-xl cursor-pointer transition block ${paymentMethod === "razorpay" ? "border-pink-400 bg-pink-50/50" : "border-gray-200 hover:border-pink-300"}`}
                    onClick={() => setPaymentMethod("razorpay")}>
                    <div className="flex items-start">
                      <input type="radio" name="payment" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="mt-1" />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 flex items-center gap-2"><CreditCard size={18} /> Pay Online</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Razorpay</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">UPI, Credit/Debit Card, Net Banking, Wallets</p>
                      </div>
                    </div>
                  </label>

                  {/* COD */}
                  <label className={`p-4 border-2 rounded-xl cursor-pointer transition block ${paymentMethod === "cod" ? "border-pink-400 bg-pink-50/50" : "border-gray-200 hover:border-pink-300"}`}
                    onClick={() => setPaymentMethod("cod")}>
                    <div className="flex items-start">
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-1" />
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">💵 Cash on Delivery</p>
                        <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>

                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setCurrentStep("address")} className="flex-1 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition">
                      Back to Address
                    </button>
                    <button type="submit" disabled={isProcessing}
                      className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-60 flex items-center justify-center gap-2">
                      {isProcessing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : paymentMethod === "razorpay" ? "Pay Now" : "Place Order"}
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
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.product?.name} x {item.quantity}</span>
                    <span className="font-medium text-gray-900">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-medium text-gray-900"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-base">
                  <span className="text-gray-900">Total</span>
                  <span className="text-pink-600 text-lg">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="mt-6 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                <Lock size={16} className="text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Secure checkout powered by Razorpay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
