// app/checkout/page.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MapPin, Lock, ChevronDown, CreditCard, Loader2, Tag, ShoppingBag } from "lucide-react"
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
  { code: '+44', country: 'gb', name: 'UK' },
  { code: '+971', country: 'ae', name: 'UAE' },
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
  const shipping = subtotal > settings.freeShippingLimit ? 0 : settings.shippingFee
  const discount = appliedCoupon ? appliedCoupon.discount : 0
  const total = subtotal + shipping - discount

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

  const inputClass = `w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 bg-gray-50/50 transition-all text-gray-900`

  return (
    <div className="min-h-screen bg-gray-50/30 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Content */}
          <div className="lg:col-span-2">
            {currentStep === "address" ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg"><MapPin className="text-pink-600 w-5 h-5" /></div>
                  Shipping Address
                </h2>
                <form onSubmit={handleAddressSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input type="text" placeholder="First Name *" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputClass} />
                    <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputClass} />
                  </div>
                  <input type="email" placeholder="Email Address *" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                  
                  <div className="flex gap-3">
                    <div className="relative" ref={dropdownRef}>
                      <div onClick={() => setShowDropdown(!showDropdown)} 
                        className="h-[52px] px-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 flex items-center gap-2 cursor-pointer hover:border-pink-300 transition-all min-w-[100px]">
                        <img src={`https://flagcdn.com/w20/${countries.find(c => c.code === formData.countryCode)?.country || 'in'}.png`} alt="" className="w-5 rounded-sm" />
                        <span className="font-bold text-sm text-gray-700">{formData.countryCode}</span>
                        <ChevronDown size={14} className="text-gray-400" />
                      </div>
                      {showDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 overflow-hidden">
                          {countries.map(c => (
                            <div key={c.code} onClick={() => { setFormData({...formData, countryCode: c.code}); setShowDropdown(false) }}
                              className="px-4 py-2 hover:bg-pink-50 flex items-center gap-3 cursor-pointer">
                              <img src={`https://flagcdn.com/w20/${c.country}.png`} alt="" className="w-5 rounded-sm" />
                              <span className="text-sm font-bold text-gray-700">{c.code}</span>
                              <span className="text-xs text-gray-400">{c.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="tel" placeholder="10-digit Phone Number *" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                  </div>

                  <input type="text" placeholder="Street Address, House No, Area *" required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className={inputClass} />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass} />
                    <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={inputClass} />
                    <input type="text" placeholder="Pincode" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className={inputClass} />
                  </div>
                  
                  <button type="submit" className="w-full py-4 bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all mt-4">Continue to Payment</button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg"><Lock className="text-pink-600 w-5 h-5" /></div>
                  Payment Method
                </h2>
                <div className="space-y-4">
                  <label className={`p-5 border-2 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${paymentMethod === 'razorpay' ? 'border-pink-500 bg-pink-50/50 shadow-md' : 'border-gray-100 hover:border-pink-200'}`}>
                    <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-5 h-5 text-pink-600 focus:ring-pink-500" />
                    <div>
                      <p className="font-bold text-gray-900 flex items-center gap-2">Pay Online (Razorpay) <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase tracking-tighter">Secure</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">UPI, Cards, NetBanking, Wallets</p>
                    </div>
                    <CreditCard className="ml-auto text-pink-300" />
                  </label>

                  <label className={`p-5 border-2 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${paymentMethod === 'cod' ? 'border-pink-500 bg-pink-50/50 shadow-md' : 'border-gray-100 hover:border-pink-200'}`}>
                    <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-pink-600 focus:ring-pink-500" />
                    <div>
                      <p className="font-bold text-gray-900">💵 Cash on Delivery</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pay when you receive your order</p>
                    </div>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <button onClick={() => setCurrentStep("address")} className="flex-1 py-4 border-2 border-gray-100 font-bold rounded-2xl text-gray-400 hover:bg-gray-50 transition-all">Back to Address</button>
                    <button onClick={paymentMethod === 'razorpay' ? initiateRazorpay : handleCOD} disabled={isProcessing} 
                      className="flex-1 py-4 bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      {isProcessing ? <Loader2 className="animate-spin" /> : (paymentMethod === 'razorpay' ? "Pay Now" : "Confirm Order")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sticky top-24 border border-gray-100 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><ShoppingBag size={80} /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">Order Summary</h3>
              
              {/* Coupon Section */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex justify-between items-center animate-pulse">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-green-600" />
                      <span className="text-sm font-bold text-green-700">{appliedCoupon.code} Applied!</span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-green-700 font-bold text-xs hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="COUPON CODE" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-xs font-bold uppercase placeholder-gray-400 text-gray-900" />
                    <button onClick={validateCoupon} disabled={couponLoading} className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all">
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-[10px] mt-2 font-bold ml-1 uppercase tracking-tighter">{couponError}</p>}
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-500 font-medium"><span>Subtotal</span><span className="text-gray-900">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-gray-500 font-medium"><span>Shipping</span><span className={shipping === 0 ? "text-green-600 font-bold" : "text-gray-900"}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="border-t border-gray-100 pt-5 flex justify-between items-end">
                  <span className="font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Final Amount</span>
                    <span className="font-black text-pink-600 text-3xl leading-none">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50">
                <p className="text-[10px] text-pink-500 font-black text-center uppercase tracking-widest leading-relaxed">
                  {shipping === 0 
                    ? "🎉 You have UNLOCKED Free Shipping!" 
                    : subtotal < settings.freeShippingLimit 
                      ? `Add ${formatPrice(settings.freeShippingLimit - subtotal)} more for FREE shipping!`
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
