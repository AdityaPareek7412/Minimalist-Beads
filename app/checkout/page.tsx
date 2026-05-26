// app/checkout/page.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MapPin, Lock, ChevronDown, CreditCard, Loader2, Tag, ShoppingBag, ArrowRight, Truck, CheckCircle2, XCircle } from "lucide-react"
import { useCart } from "@/context/cartContext"
import { formatPrice, getImageUrl } from "@/lib/utils/helpers"

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
  const [settings, setSettings] = useState({ shippingFee: 80, freeShippingLimit: 0 })
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
      .then(data => {
        if (data) setSettings({
          shippingFee: typeof data.shippingFee === 'number' ? data.shippingFee : 80,
          freeShippingLimit: typeof data.freeShippingLimit === 'number' ? data.freeShippingLimit : 0
        })
      })
      .catch(() => { })

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    countryCode: "+91", street: "", city: "", state: "",
    postalCode: "", country: "India",
  })
  const [paymentMethod, setPaymentMethod] = useState<"razorpay">("razorpay")

  const subtotal = getCartTotal()
  const shipping = settings.shippingFee
  const discount = appliedCoupon ? appliedCoupon.discount : 0
  const baseTotal = subtotal + shipping - discount
  const processingFee = Math.round((baseTotal * 0.0236) * 100) / 100
  const finalTotal = baseTotal + processingFee
  const isBelowMinimum = baseTotal < 199

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

    if (isBelowMinimum) {
      alert("Minimum order value is ₹199 (including shipping). Please add more items to your bag!");
      return;
    }

    // Check all required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'postalCode'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        alert(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    // Name validation (only letters and spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.firstName)) {
      alert("First Name should only contain letters");
      return;
    }
    if (!nameRegex.test(formData.lastName)) {
      alert("Last Name should only contain letters");
      return;
    }

    // Phone validation (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    // Email validation (simple regex to supplement HTML5)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setCurrentStep("payment")
  }

  const initiateRazorpay = async () => {
    setIsProcessing(true)
    try {
      // Step 1: Create a PENDING order in the database first
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cart,
          subtotal,
          shippingCost: shipping,
          discount,
          couponId: appliedCoupon?.couponId,
          totalAmount: finalTotal,
          paymentMethod: "razorpay"
        })
      })

      const orderData = await orderRes.json()
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initiate order in database")
      }

      const dbOrderId = orderData.order.id

      // Step 2: Create the Razorpay Order with dbOrderId as the receipt
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          receipt: dbOrderId,
          notes: {
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: `${formData.countryCode}${formData.phone}`,
            dbOrderId: dbOrderId
          },
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      // Step 3: Open the Razorpay Payment Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Minimalist Beads",
        description: "Curated Accessories",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            // Step 4: Verify signature and confirm the order in the database
            const confirmRes = await fetch("/api/orders/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                dbOrderId: dbOrderId
              })
            })

            const confirmData = await confirmRes.json()
            if (!confirmData.success) {
              throw new Error(confirmData.error || "Payment verification failed")
            }

            clearCart()
            router.push(`/order-confirmation?orderId=${dbOrderId}&amount=${finalTotal}&method=online`)
          } catch (err: any) {
            alert("Payment confirmation error: " + err.message)
            setIsProcessing(false)
          }
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


  const inputClass = `w-full px-6 py-3.5 bg-pink-50/30 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-sm placeholder-gray-400 font-sans`

  return (
    <div className="min-h-screen bg-[#fdf0f5] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${currentStep === "address" ? 'text-pink-500' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${currentStep === "address" ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>1</span>
              Shipping
            </div>
            <div className="w-8 h-[1px] bg-pink-200"></div>
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${currentStep === "payment" ? 'text-pink-500' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${currentStep === "payment" ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>2</span>
              Payment
            </div>
          </div>

          {isBelowMinimum && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 bg-rose-50 border border-rose-200 p-4 rounded-2xl inline-block">
              <p className="text-rose-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 px-6">
                <XCircle size={16} /> Minimum order value is ₹199 (including shipping)
              </p>
              <p className="text-rose-400 text-[10px] mt-1 font-medium italic">Please add ₹{(199 - baseTotal).toFixed(2)} more to continue</p>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === "address" ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-pink-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-pink-50 rounded-full text-pink-500"><MapPin size={20} /></div>
                  Shipping Details
                </h2>
                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">First Name</label>
                      <input type="text" placeholder="Aditya" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">Last Name</label>
                      <input type="text" placeholder="Pareek" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">Email Address</label>
                    <input type="email" placeholder="hello@example.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">Phone Number</label>
                    <div className="flex gap-3">
                      <div className="relative" ref={dropdownRef}>
                        <div onClick={() => setShowDropdown(!showDropdown)}
                          className="h-[52px] px-5 border border-pink-100 rounded-2xl bg-pink-50/30 flex items-center gap-2 cursor-pointer hover:border-pink-300 transition-all min-w-[100px]">
                          <img src={`https://flagcdn.com/w20/${countries.find(c => c.code === formData.countryCode)?.country || 'in'}.png`} alt="" className="w-5 rounded-sm" />
                          <span className="font-bold text-sm text-gray-700">{formData.countryCode}</span>
                          <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        {showDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-pink-100 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                            {countries.map(c => (
                              <div key={c.code} onClick={() => { setFormData({ ...formData, countryCode: c.code }); setShowDropdown(false) }}
                                className="px-4 py-2.5 hover:bg-pink-50 flex items-center gap-3 cursor-pointer transition-colors">
                                <img src={`https://flagcdn.com/w20/${c.country}.png`} alt="" className="w-5 rounded-sm" />
                                <span className="text-sm font-bold text-gray-700">{c.code}</span>
                                <span className="text-xs text-gray-400">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        placeholder="10-digit Number"
                        required
                        maxLength={10}
                        pattern="\d{10}"
                        value={formData.phone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setFormData({ ...formData, phone: val });
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">Street Address</label>
                    <input type="text" placeholder="House no., Street name, Area" required value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} className={inputClass} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">City</label>
                      <input type="text" placeholder="Jaipur" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">State</label>
                      <input type="text" placeholder="Rajasthan" required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-4 tracking-widest">Pincode</label>
                      <input
                        type="text"
                        placeholder="302001"
                        required
                        value={formData.postalCode}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, postalCode: val });
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 transition-all mt-6 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2">
                    Continue to Payment <ArrowRight size={18} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-pink-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-pink-50 rounded-full text-pink-500"><Lock size={20} /></div>
                  Payment Selection
                </h2>
                <div className="space-y-4">
                  <label className={`p-6 border rounded-2xl cursor-pointer flex items-center gap-4 transition-all border-pink-500 bg-pink-50/50`}>
                    <input type="radio" checked={true} readOnly className="w-5 h-5 text-pink-600 focus:ring-pink-500" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 flex items-center gap-2">Pay Online (Razorpay) <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded uppercase tracking-widest">Secure</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">UPI, Cards, NetBanking, Wallets</p>
                    </div>
                    <CreditCard size={24} className="text-pink-300" />
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <button onClick={() => setCurrentStep("address")} className="flex-1 py-4 border border-pink-100 font-bold rounded-full text-gray-400 hover:bg-pink-50 transition-all uppercase tracking-widest text-xs">Back</button>
                    <button
                      onClick={initiateRazorpay}
                      disabled={isProcessing || isBelowMinimum}
                      className="flex-[2] py-4 bg-gray-900 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" /> : "Place Order"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-8 sticky top-28 border border-pink-100 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-6 pb-4 border-b border-pink-50 uppercase tracking-widest text-center">Your Bag</h3>

              <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                {cart.map((item) => {
                  const itemPrice = item.selectedVariant?.price ?? item.product?.price ?? 0;
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-pink-50/30 flex-shrink-0 border border-pink-100">
                        <Image
                          src={getImageUrl(item.product?.images?.[0]?.url)}
                          alt={item.product?.name || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-serif font-bold text-gray-900 truncate">{item.product?.name}</p>
                        {item.selectedVariant && (
                          <p className="text-[9px] font-bold text-pink-500 uppercase tracking-widest mt-0.5 truncate">
                            Variant: {item.selectedVariant.name}
                          </p>
                        )}
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-pink-600 flex-shrink-0">{formatPrice(itemPrice * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Section */}
              <div className="mb-8">
                {appliedCoupon ? (
                  <div className="bg-sage-50 border border-sage-100 rounded-2xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-sage-600" />
                      <span className="text-xs font-bold text-sage-700">{appliedCoupon.code} Applied!</span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-sage-500 font-bold text-[10px] uppercase hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="COUPON CODE" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                      className="flex-1 px-5 py-2.5 bg-pink-50/30 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 outline-none text-[10px] font-bold uppercase tracking-widest placeholder-gray-400 text-gray-900" />
                    <button onClick={validateCoupon} disabled={couponLoading} className="px-6 py-2.5 bg-gray-900 text-white text-[10px] font-bold rounded-xl hover:bg-pink-600 transition-all uppercase tracking-widest">
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-[9px] mt-2 font-bold ml-2 uppercase tracking-widest">{couponError}</p>}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest"><span>Subtotal</span><span className="text-gray-900 font-bold">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest"><span>Shipping</span><span className="text-gray-900 font-bold">{formatPrice(shipping)}</span></div>
                {discount > 0 && <div className="flex justify-between text-pink-600 font-bold text-xs uppercase tracking-widest"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest"><span>Payment Processing Fee</span><span className="text-gray-900 font-bold">{formatPrice(processingFee)}</span></div>
                <div className="border-t border-pink-50 pt-6 flex justify-between items-center">
                  <span className="font-serif font-bold text-gray-900">Total</span>
                  <motion.span
                    key={finalTotal}
                    initial={{ opacity: 0.5, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="font-bold text-pink-600 text-2xl"
                  >
                    {formatPrice(finalTotal)}
                  </motion.span>
                </div>
              </div>

              <div className="p-5 bg-pink-50/50 rounded-[1.5rem] border border-pink-100/50">
                <p className="text-[9px] text-pink-500 font-bold text-center uppercase tracking-widest leading-relaxed">
                  ✨ Charms magic takes 7-12 days to reach its new home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
