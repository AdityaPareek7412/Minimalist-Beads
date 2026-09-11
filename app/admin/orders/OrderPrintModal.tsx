"use client"

import { useState, useEffect, useRef } from "react"
import { X, Printer, Download, Image as ImageIcon, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils/helpers"
import { toJpeg } from "html-to-image"

import { Portal } from "@/components/common/Portal"

interface OrderPrintModalProps {
  orders: any[]
  isOpen: boolean
  onClose: () => void
}

export default function OrderPrintModal({ orders, isOpen, onClose }: OrderPrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null)
  const [isDownloadingJpeg, setIsDownloadingJpeg] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!isOpen || !orders || orders.length === 0) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadJpeg = async () => {
    if (isDownloadingJpeg) return
    setIsDownloadingJpeg(true)
    try {
      const cards = document.querySelectorAll<HTMLElement>(".print-dispatch-card")
      if (!cards || cards.length === 0) {
        throw new Error("No dispatch slip element found")
      }

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i]
        const orderNum = orders[i]?.orderNumber ? `${orders[i].orderNumber}` : `order-${i + 1}`

        const dataUrl = await toJpeg(card, {
          quality: 0.95,
          backgroundColor: "#ffffff",
          pixelRatio: 2, // High resolution for clear text and badges
        })

        const link = document.createElement("a")
        link.download = `${orderNum.replace(/^#/, "")}-dispatch-slip.jpg`
        link.href = dataUrl
        link.click()

        if (cards.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      }
    } catch (err: any) {
      console.error("JPEG generation failed:", err)
      alert("Could not generate JPEG: " + (err.message || "Unknown error"))
    } finally {
      setIsDownloadingJpeg(false)
    }
  }

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

  return (
    <Portal>
      <div id="order-print-portal-root">
        {/* Modal Backdrop */}
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print-modal-backdrop">
          {/* Container */}
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print-modal-container">
            
            {/* Modal Action Bar (Hidden during print) */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print-modal-actions flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-pink-600" />
                <h3 className="font-bold text-xs sm:text-sm text-gray-900">
                  Dispatch Slip ({orders.length} order{orders.length > 1 ? "s" : ""})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Direct JPEG Download */}
                <button
                  onClick={handleDownloadJpeg}
                  disabled={isDownloadingJpeg}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Save dispatch slip directly as high-resolution JPEG image"
                >
                  {isDownloadingJpeg ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  <span>{isDownloadingJpeg ? "Saving..." : "Download JPEG"}</span>
                </button>

                {/* Print / Save as PDF */}
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-pink-600 text-white font-bold text-xs rounded-xl hover:bg-pink-700 transition-all flex items-center gap-1.5 shadow-xs"
                  title="Open browser print dialog / Save as PDF"
                >
                  <Printer size={14} />
                  <span>Print / PDF</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Slips Area */}
            <div 
              id="print-dispatch-area" 
              ref={printAreaRef} 
              className="p-5 sm:p-8 overflow-y-auto space-y-8 sm:space-y-12 print-slips-container"
            >
              {orders.map((order, index) => (
                <div 
                  key={order.id} 
                  className={`space-y-5 sm:space-y-6 border border-gray-200 rounded-2xl p-5 sm:p-8 bg-white print-dispatch-card ${
                    index < orders.length - 1 ? "print-page-break" : ""
                  }`}
                >
                  {/* Slip Header */}
                  <div className="flex justify-between items-start border-b border-gray-200 pb-4 sm:pb-5 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-black text-xs sm:text-sm">
                          M
                        </div>
                        <span className="font-serif font-black text-lg sm:text-xl text-gray-900 tracking-tight">
                          Minimalist Beads
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Handcrafted Curated Accessories • minimalistbeads.in</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="inline-block px-2.5 py-1 bg-pink-50 border border-pink-200 text-pink-700 font-black font-mono text-sm sm:text-base rounded-lg">
                        #{order.orderNumber ? String(order.orderNumber).replace(/^#/, "") : ""}
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-1 font-medium">{formatIST(order.createdAt)}</p>
                      <p className="text-[10px] text-gray-400 font-mono">Ref: {order.id}</p>
                    </div>
                  </div>

                  {/* Courier & Customer Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 print-customer-box gap-4 sm:gap-6 bg-gray-50/70 p-4 sm:p-5 rounded-xl border border-gray-100">
                    {/* Deliver To */}
                    <div className="space-y-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deliver To:</p>
                      <p className="font-black text-gray-900 text-sm sm:text-base break-words">{order.customerName || "Customer"}</p>
                      <p className="font-bold text-gray-800 text-xs sm:text-sm">{order.customerPhone || "N/A"}</p>
                      <p className="text-xs text-gray-600 break-all">{order.customerEmail || ""}</p>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-1 min-w-0 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-6 print-address-col">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping Address:</p>
                      {order.shippingAddress ? (
                        <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed break-words">
                          {order.shippingAddress.street}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} - <strong className="font-bold text-gray-900">{order.shippingAddress.postalCode}</strong><br />
                          {order.shippingAddress.country}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No shipping address recorded</p>
                      )}
                    </div>
                  </div>

                  {/* Prominent Customer Order Note */}
                  {order.customerNote && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 sm:p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                        ⚠️ SPECIAL PACKING / CUSTOMER INSTRUCTIONS:
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1 pl-1 whitespace-pre-wrap break-words">
                        "{order.customerNote}"
                      </p>
                    </div>
                  )}

                  {/* Ordered Items Table */}
                  <div className="overflow-x-auto print-table-wrapper">
                    <table className="w-full text-left text-xs border-collapse min-w-[320px] sm:min-w-0">
                      <thead>
                        <tr className="border-b-2 border-gray-900 text-gray-700">
                          <th className="py-2.5 font-bold uppercase tracking-wider">Item Details</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-center">Qty</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-right">Price</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {order.items?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="py-3 font-semibold text-gray-900 pr-2">
                              <span className="break-words">{item.product?.name || "Product"}</span>
                              {item.selectedVariantName && (
                                <span className="block text-[11px] font-bold text-pink-600 uppercase">
                                  Option: {item.selectedVariantName}
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-center font-bold text-gray-800">x{item.quantity}</td>
                            <td className="py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(item.price)}</td>
                            <td className="py-3 text-right font-bold text-gray-900 whitespace-nowrap">{formatPrice(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Totals */}
                  <div className="border-t-2 border-gray-900 pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="text-xs space-y-1">
                      <p className="text-gray-500">
                        Payment Method: <strong className="text-gray-800 uppercase">{order.payment?.paymentMethod || "ONLINE"}</strong>
                      </p>
                      <p className="text-gray-500">
                        Payment Status: <strong className={`font-bold ${order.paymentStatus === "COMPLETED" ? "text-emerald-700" : "text-amber-700"}`}>
                          {order.paymentStatus === "COMPLETED" ? "PAID IN FULL" : "PAYMENT PENDING"}
                        </strong>
                      </p>
                    </div>

                    <div className="w-full sm:w-auto text-right space-y-1 text-xs">
                      <div className="flex justify-between sm:justify-end sm:gap-6 text-gray-600">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-gray-900">{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between sm:justify-end sm:gap-6 text-gray-600">
                        <span>Shipping:</span>
                        <span className="font-semibold text-gray-900">{formatPrice(order.shippingCost)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between sm:justify-end sm:gap-6 text-pink-600 font-semibold">
                          <span>Discount:</span>
                          <span>-{formatPrice(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between sm:justify-end sm:gap-6 pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                        <span>Grand Total:</span>
                        <span className="text-base text-pink-600">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Slip Footer */}
                  <div className="pt-4 border-t border-dashed border-gray-200 text-center text-[10px] text-gray-400 font-medium">
                    Thank you for supporting handcrafted minimalist accessories! If you have questions, contact minimalistbeads.in@gmail.com
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Robust 1-Page Global Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          /* Completely hide the regular page layout so no phantom pages are created */
          body > *:not(#order-print-portal-root) {
            display: none !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            width: 100% !important;
          }

          #order-print-portal-root {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          #order-print-portal-root * {
            visibility: visible !important;
          }

          .print-modal-backdrop {
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            display: block !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            width: 100% !important;
            inset: auto !important;
          }

          .print-modal-container {
            box-shadow: none !important;
            max-height: none !important;
            height: auto !important;
            min-height: 0 !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
            display: block !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }

          .print-modal-actions {
            display: none !important;
          }

          .print-slips-container {
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
          }

          .print-dispatch-card {
            box-sizing: border-box !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            border: 1px solid #d1d5db !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-customer-box {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            background: #f9fafb !important;
          }

          .print-address-col {
            border-top-width: 0 !important;
            border-left-width: 1px !important;
            padding-left: 1.5rem !important;
            padding-top: 0 !important;
          }

          .print-table-wrapper {
            overflow: visible !important;
          }

          /* For multiple order slips, cleanly break after each slip */
          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }

          /* Ensure exact colors print crisp */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </Portal>
  )
}

