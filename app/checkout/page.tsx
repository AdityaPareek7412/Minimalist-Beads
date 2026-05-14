// app/checkout/page.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, MapPin, Truck, Lock, ChevronDown, CreditCard, Loader2, Tag } from "lucide-react"
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
  { code: '+971', country: 'ae', name: 'UAE' },
  { code: '+977', country: 'np', name: 'Nepal' },
]

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<"address" | "payment">("address")
  const [showDropdown, setShowDropdown] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Settings & Coupon State
  const [settings, setSettings] = useState({ shippingFee: 50, freeShippingLimit: 500 })
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  // Load Razorpay & Settings
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {})

    return () => { if (document.body.contains(script)) document.body.removeChild(script) }
  }, [])

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    countryCode: "+91", street: "", city: "", state: "",
    postalCode: "", country: "India",
  })
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay")

  const subtotal = getCartTotal()
  const shipping = subtotal > settings.freeShippingLimit ? 0 : settings.shippingFee
  const discount = appliedCoupon ? appliedCoupon.discount : 0
  const total = subtotal + shipping - discount

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateCoupon = async () => {
    if (!couponCode) return
    setCouponLoading(true)
    setCouponError("")
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      if (data.success) {
        setAppliedCoupon(data)
        setCouponCode("")
      } else {
        setCouponError(data.error)
      }
    } catch (err) {
      setCouponError("Failed to validate coupon")
    } finally {
      setCouponLoading(false)
    }
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.phone.trim() || !formData.street.trim()) {
      alert("Please fill all required fields")
      return
    }
    setCurrentStep("payment")
  }

  const initiateRazorpay = async () => {
    setIsProcessing(true)
    try {
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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Minimalist Beads",
        description: "Handcrafted Jewelry",
        order_id: data.order.id,
        handler: async function (response: any) {
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              cart,
              subtotal,
              shippingCost: shipping,
              discount,
              couponId: appliedCoupon?.couponId,
              totalAmount: total,
              paymentMethod: "razorpay",
              paymentId: response.razorpay_payment_id
            })
          })

          clearCart()
          router.push(`/order-confirmation?orderId=${response.razorpay_order_id}&amount=${total}&method=online`)
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: `${formData.countryCode}${formData.phone}`,
        },
        theme: { color: "#f472b6" },
        modal: { ondismiss: () => setIsProcessing(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      alert("Payment error: " + error.message)
      setIsProcessing(false)
    }
  }

  const handleCOD = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cart,
          subtotal,
          shippingCost: shipping,
          discount,
          couponId: appliedCoupon?.couponId,
          totalAmount: total,
          paymentMethod: "cod",
        })
      })
      
      const data = await res.json()
      if (data.success) {
        clearCart()
        router.push(`/order-confirmation?orderId=${data.order.orderNumber}&amount=${total}&method=cod`)
      }
    } catch (error) {
      alert("Order failed")
      setIsProcessing(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border-2 rounded-xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-4 focus:ring-pink-500/20 text-gray-900 bg-gray-50 transition-all duration-300 border-gray-200 focus:border-pink-400`

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Content */}
          <div className="lg:col-span-2">
            {currentStep === "address" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><MapPin className="text-pink-500" /> Shipping Address</h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name *" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputClass("firstName")} />
                    <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputClass("lastName")} />
                  </div>
                  <input type="email" placeholder="Email *" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass("email")} />
                  <div className="flex gap-2">
                    <input type="tel" placeholder="10-digit Phone *" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass("phone")} />
                  </div>
                  <input type="text" placeholder="Street Address *" required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className={inputClass("street")} />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass("city")} />
                    <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputClass("state")} />
                    <input type="text" placeholder="Pincode" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className={inputClass("postalCode")} />
                  </div>
                  <button type="submit" className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:bg-pink-700 transition-all mt-6">Continue to Payment</button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Lock className="text-pink-500" /> Payment Method</h2>
                <div className="space-y-4">
                  <label className={`p-4 border-2 rounded-xl cursor-pointer block ${paymentMethod === 'razorpay' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
                    <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="mr-3" />
                    <span className="font-bold">Pay Online (Razorpay)</span>
                  </label>
                  <label className={`p-4 border-2 rounded-xl cursor-pointer block ${paymentMethod === 'cod' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
                    <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-3" />
                    <span className="font-bold">Cash on Delivery</span>
                  </label>
                  <div className="flex gap-4 pt-6">
                    <button onClick={() => setCurrentStep("address")} className="flex-1 py-4 border-2 border-gray-200 font-bold rounded-xl text-gray-600">Back</button>
                    <button onClick={paymentMethod === 'razorpay' ? initiateRazorpay : handleCOD} disabled={isProcessing} className="flex-1 py-4 bg-pink-600 text-white font-bold rounded-xl disabled:opacity-50">
                      {isProcessing ? "Processing..." : "Confirm Order"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-3xl p-6 sticky top-24 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
              
              {/* Coupon Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-green-600" />
                      <span className="text-sm font-bold text-green-700">{appliedCoupon.code} applied!</span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-green-700 font-bold text-xs">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Coupon Code" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-sm uppercase" />
                    <button onClick={validateCoupon} disabled={couponLoading} className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all">
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-xs mt-2 ml-1">{couponError}</p>}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-black text-pink-600 text-2xl">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-pink-50 rounded-2xl border border-pink-100">
                <p className="text-[11px] text-pink-600 font-bold text-center">
                  {shipping === 0 
                    ? "🎉 You have UNLOCKED Free Shipping!" 
                    : `Free shipping on orders above ${formatPrice(settings.freeShippingLimit)}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
