"use client"

import { useState } from "react"
import { 
  X, Printer, Copy, Check, ExternalLink, Phone, Mail, 
  MapPin, Package, CreditCard, MessageSquare, Truck, 
  Loader2, ChevronRight, AlertCircle 
} from "lucide-react"
import { formatPrice, getImageUrl, formatParcelShippingLabel } from "@/lib/utils/helpers"

interface OrderDetailDrawerProps {
  order: any | null
  isOpen: boolean
  onClose: () => void
  onPrint: (order: any) => void
  onStatusUpdated?: (orderId: string, newStatus: string) => void
}

export default function OrderDetailDrawer({
  order,
  isOpen,
  onClose,
  onPrint,
  onStatusUpdated
}: OrderDetailDrawerProps) {
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPaymentId, setCopiedPaymentId] = useState(false)
  const [copiedParcel, setCopiedParcel] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(order?.status || "PENDING")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  
  // Tracking state
  const [showTracking, setShowTracking] = useState(false)
  const [trackingId, setTrackingId] = useState(order?.trackingId || "")
  const [trackingUrl, setTrackingUrl] = useState(order?.trackingUrl || "https://www.indiapost.gov.in/#trackandtrace")
  const [courier, setCourier] = useState("indiapost")

  if (!isOpen || !order) return null

  const formatIST = (date: any) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }).format(new Date(date))
    } catch {
      return String(date)
    }
  }

  const copyToClipboard = (text: string, type: "id" | "payment") => {
    navigator.clipboard.writeText(text)
    if (type === "id") {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } else {
      setCopiedPaymentId(true)
      setTimeout(() => setCopiedPaymentId(false), 2000)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === "SHIPPED") {
      setShowTracking(true)
      return
    }

    setUpdatingStatus(true)
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: newStatus })
      })
      if (res.ok) {
        setCurrentStatus(newStatus)
        order.status = newStatus
        if (onStatusUpdated) onStatusUpdated(order.id, newStatus)
      } else {
        alert("Failed to update status")
      }
    } catch {
      alert("Error updating status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleTrackingSubmit = async () => {
    setUpdatingStatus(true)
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: "SHIPPED",
          trackingId,
          trackingUrl
        })
      })
      if (res.ok) {
        setCurrentStatus("SHIPPED")
        order.status = "SHIPPED"
        order.trackingId = trackingId
        order.trackingUrl = trackingUrl
        setShowTracking(false)
        if (onStatusUpdated) onStatusUpdated(order.id, "SHIPPED")
      } else {
        alert("Failed to update tracking")
      }
    } catch {
      alert("Error updating tracking")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleCopyParcelDetails = async () => {
    if (!order) return
    const text = formatParcelShippingLabel(order)
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      setCopiedParcel(true)
      setTimeout(() => setCopiedParcel(false), 2000)
    } catch (err) {
      console.error("Failed to copy parcel details:", err)
    }
  }

  const cleanPhone = (order.customerPhone || "").replace(/\D/g, "")
  const whatsAppNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone

  const isPaid = order.paymentStatus === "COMPLETED"
  const isPending = order.paymentStatus === "PENDING"
  const isFailed = order.paymentStatus === "FAILED"
  const isRefunded = order.paymentStatus === "REFUNDED"

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                  (order.orderNumber || "").replace(/^#/, "").startsWith("MB") 
                    ? "bg-pink-100 text-pink-700 border border-pink-200" 
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}>
                  #{(order.orderNumber || "").replace(/^#/, "")}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isPaid ? "bg-emerald-100 text-emerald-700" :
                  isPending ? "bg-amber-100 text-amber-700" :
                  isFailed ? "bg-rose-100 text-rose-700" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {isPaid ? "Paid" : isPending ? "Unpaid" : isFailed ? "Failed" : "Refunded"}
                </span>

                <span className="text-xs text-gray-500 font-medium">
                  {formatIST(order.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Internal ID:</span>
                <span className="font-mono text-gray-600">{order.id}</span>
                <button
                  onClick={() => copyToClipboard(order.id, "id")}
                  className="hover:text-pink-600 transition-colors p-1"
                  title="Copy internal ID"
                >
                  {copiedId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyParcelDetails}
                className={`p-2.5 rounded-xl transition-all border flex items-center gap-1.5 text-xs font-bold ${
                  copiedParcel
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "text-gray-600 hover:text-pink-600 hover:bg-pink-50 border-gray-200 hover:border-pink-200"
                }`}
                title="Copy parcel shipping label (To/From)"
              >
                {copiedParcel ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                <span className="hidden sm:inline">{copiedParcel ? "Copied!" : "Copy Parcel"}</span>
              </button>
              <button
                onClick={() => onPrint(order)}
                className="p-2.5 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all border border-gray-200 hover:border-pink-200 flex items-center gap-1.5 text-xs font-bold"
                title="Print Packing Slip"
              >
                <Printer size={16} />
                <span className="hidden sm:inline">Print Slip</span>
              </button>
              <button
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Status & Fulfillment Control */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Order Status</span>
                </div>
                {updatingStatus && <Loader2 size={14} className="animate-spin text-pink-600" />}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all text-center ${
                      currentStatus === st
                        ? "bg-pink-600 text-white shadow-xs"
                        : "bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Shipping Details form if Shipped */}
              {showTracking && (
                <div className="pt-3 mt-2 border-t border-gray-200 space-y-2">
                  <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <Truck size={14} /> Add Courier & Tracking
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={courier}
                      onChange={(e) => {
                        const val = e.target.value
                        setCourier(val)
                        if (val === "indiapost") setTrackingUrl("https://www.indiapost.gov.in/#trackandtrace")
                        else if (val === "tirupati") setTrackingUrl("https://trackcourier.io/tirupati-courier-tracking")
                        else setTrackingUrl("")
                      }}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="indiapost">India Post</option>
                      <option value="tirupati">Tirupati Courier</option>
                      <option value="custom">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="AWB / Tracking Number"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowTracking(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTrackingSubmit}
                      disabled={updatingStatus}
                      className="px-4 py-1.5 bg-pink-600 text-white text-xs font-bold rounded-lg hover:bg-pink-700"
                    >
                      Save & Mark Shipped
                    </button>
                  </div>
                </div>
              )}

              {order.trackingId && !showTracking && (
                <div className="pt-2 text-xs flex items-center justify-between text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200">
                  <div>
                    <span className="font-semibold text-gray-700">Tracking ID: </span>
                    <span className="font-mono text-pink-600">{order.trackingId}</span>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                    >
                      Track Package <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Customer Order Note (Featured Requirement) */}
            <div className={`p-4 rounded-2xl border ${
              order.customerNote 
                ? "bg-amber-50/70 border-amber-200" 
                : "bg-gray-50 border-gray-100"
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare size={16} className={order.customerNote ? "text-amber-600" : "text-gray-400"} />
                <h4 className={`text-xs font-bold uppercase tracking-wider ${
                  order.customerNote ? "text-amber-800" : "text-gray-500"
                }`}>
                  Customer Order Note
                </h4>
              </div>
              {order.customerNote ? (
                <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap pl-6">
                  "{order.customerNote}"
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic pl-6">
                  No customer note provided.
                </p>
              )}
            </div>

            {/* Customer Details */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Phone size={14} /> Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="font-bold text-gray-900">{order.customerName || "Guest Customer"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${order.customerPhone}`} className="font-bold text-pink-600 hover:underline">
                      {order.customerPhone || "N/A"}
                    </a>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${whatsAppNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-colors"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-400">Email</p>
                  <a href={`mailto:${order.customerEmail}`} className="font-medium text-gray-800 hover:text-pink-600 transition-colors break-all">
                    {order.customerEmail || "N/A"}
                  </a>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="pt-3 border-t border-gray-100 text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={12} /> Shipping Address
                    </p>
                    <button
                      onClick={handleCopyParcelDetails}
                      className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                        copiedParcel
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100"
                      }`}
                      title="Copy parcel shipping label"
                    >
                      {copiedParcel ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedParcel ? "Copied!" : "Copy Parcel Label"}</span>
                    </button>
                  </div>
                  <p className="text-gray-800 font-medium leading-relaxed break-words">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} /> Items ({order.items?.length || 0})
              </h4>
              <div className="space-y-3 divide-y divide-gray-50">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.product?.images?.[0] ? (
                          <img
                            src={getImageUrl(item.product.images[0].url)}
                            alt={item.product?.name || ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {item.product?.name || "Product"}
                        </p>
                        {item.selectedVariantName && (
                          <p className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                            Variant: {item.selectedVariantName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-sm text-gray-900 flex-shrink-0">
                      {formatPrice(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Financial Summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} /> Payment & Billing
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs pb-3 border-b border-gray-100">
                <div>
                  <span className="text-gray-400">Payment Method</span>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {order.payment?.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay Online"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Payment ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-gray-800 truncate">
                      {order.payment?.paymentId || "N/A"}
                    </span>
                    {order.payment?.paymentId && (
                      <button
                        onClick={() => copyToClipboard(order.payment.paymentId, "payment")}
                        className="hover:text-pink-600 p-0.5"
                        title="Copy payment ID"
                      >
                        {copiedPaymentId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-gray-900">{formatPrice(order.shippingCost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-pink-600 font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span className="font-black text-gray-900">Total Paid / Amount</span>
                  <span className="text-xl font-black text-pink-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
            <button
              onClick={() => onPrint(order)}
              className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-all text-xs flex items-center justify-center gap-2 shadow-xs"
            >
              <Printer size={15} /> Print Dispatch Slip
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-pink-600 transition-all text-xs"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
