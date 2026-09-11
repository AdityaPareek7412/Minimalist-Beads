"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Search, Filter, Download, Printer, Trash2, CheckSquare, 
  Square, Eye, MessageSquare, ChevronLeft, ChevronRight, 
  Calendar, RotateCcw, Package, CreditCard, Loader2, AlertTriangle, Check, X
} from "lucide-react"
import { formatPrice, getImageUrl } from "@/lib/utils/helpers"
import OrderDetailDrawer from "./OrderDetailDrawer"
import OrderPrintModal from "./OrderPrintModal"
import OrderStatusDropdown from "./OrderStatusDropdown"

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  shippingCost: number
  discount: number
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  customerNote: string | null
  trackingId: string | null
  trackingUrl: string | null
  createdAt: string
  shippingAddress: any
  payment: any
  items: any[]
}

interface Stats {
  total: number
  paid: number
  unpaid: number
  pendingStatus: number
  delivered: number
  revenue: number
}

interface OrdersViewProps {
  orders: Order[]
  totalOrders: number
  currentPage: number
  pageSize: number
  stats: Stats
}

export default function OrdersView({
  orders,
  totalOrders,
  currentPage,
  pageSize,
  stats
}: OrdersViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPendingTransition, startTransition] = useTransition()

  // Active filters from URL
  const activeSearch = searchParams.get("search") || ""
  const activePayment = searchParams.get("payment") || "ALL"
  const activeStatus = searchParams.get("status") || "ALL"
  const activeDateRange = searchParams.get("dateRange") || "ALL"
  const activeExactDate = searchParams.get("exactDate") || ""
  const activeMethod = searchParams.get("method") || "ALL"

  // Local search input for debouncing
  const [searchInput, setSearchInput] = useState(activeSearch)

  // Selection & Modal States
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeDrawerOrder, setActiveDrawerOrder] = useState<Order | null>(null)
  const [printOrders, setPrintOrders] = useState<Order[]>([])
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  
  // Bulk status update state
  const [bulkStatus, setBulkStatus] = useState("")
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false)
  const [isDeletingPending, setIsDeletingPending] = useState(false)

  // Helper to update URL params cleanly
  const updateFilter = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "ALL" || val === "") {
        params.delete(key)
      } else {
        params.set(key, val)
      }
    })
    // Reset to page 1 on filter changes unless page is explicitly being set
    if (!updates.page) {
      params.delete("page")
    }
    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`)
    })
  }

  // Handle debounced search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter({ search: searchInput.trim() })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput("")
    router.push("/admin/orders")
  }

  const isAnyFilterActive = 
    activeSearch || 
    activePayment !== "ALL" || 
    activeStatus !== "ALL" || 
    activeDateRange !== "ALL" ||
    activeExactDate ||
    activeMethod !== "ALL"

  // Selection helpers
  const allVisibleSelected = orders.length > 0 && orders.every(o => selectedIds.includes(o.id))
  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(orders.map(o => o.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Print handlers
  const openBulkPrint = () => {
    if (selectedIds.length === 0) return
    const toPrint = orders.filter(o => selectedIds.includes(o.id))
    setPrintOrders(toPrint)
    setIsPrintModalOpen(true)
  }

  const openSinglePrint = (order: Order) => {
    setPrintOrders([order])
    setIsPrintModalOpen(true)
  }

  const handlePrintSelected = openBulkPrint
  const handlePrintSingle = openSinglePrint

  // Export handlers
  const handleExport = (onlySelected: boolean = false) => {
    const params = new URLSearchParams()
    if (onlySelected && selectedIds.length > 0) {
      params.set("ids", selectedIds.join(","))
    } else {
      if (activeSearch) params.set("search", activeSearch)
      if (activePayment !== "ALL") params.set("payment", activePayment)
      if (activeStatus !== "ALL") params.set("status", activeStatus)
      if (activeDateRange !== "ALL") params.set("dateRange", activeDateRange)
      if (activeExactDate) params.set("exactDate", activeExactDate)
    }
    window.open(`/api/admin/orders/export?${params.toString()}`, "_blank")
  }

  // Bulk Status Update
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to mark ${selectedIds.length} orders as ${bulkStatus}?`)) return

    setIsUpdatingBulk(true)
    try {
      const res = await fetch("/api/admin/orders/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedIds, status: bulkStatus })
      })
      if (res.ok) {
        setSelectedIds([])
        setBulkStatus("")
        router.refresh()
      } else {
        alert("Failed to update status in bulk")
      }
    } catch {
      alert("Error updating status in bulk")
    } finally {
      setIsUpdatingBulk(false)
    }
  }

  // Delete All Pending Orders (Preserved existing feature)
  const handleDeleteAllPending = async () => {
    if (!confirm("Are you sure you want to delete ALL unpaid pending orders? This cannot be undone.")) return
    setIsDeletingPending(true)
    try {
      const res = await fetch("/api/admin/orders/delete-pending", { method: "POST" })
      if (!res.ok) {
        // Fallback to server action if route doesn't exist
        const { deleteAllPendingOrders } = await import("./actions")
        await deleteAllPendingOrders()
      }
      router.refresh()
    } catch {
      alert("Failed to delete pending orders")
    } finally {
      setIsDeletingPending(false)
    }
  }

  // Single Order Delete
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" })
      if (res.ok) {
        router.refresh()
      } else {
        alert("Failed to delete order")
      }
    } catch {
      alert("Failed to delete order")
    }
  }

  // IST Date Formatter
  const formatIST = (date: string) => {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }).format(new Date(date))
    } catch {
      return date
    }
  }

  const totalPages = Math.ceil(totalOrders / pageSize) || 1

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* 1. Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Orders Management
            {isPendingTransition && <Loader2 size={20} className="animate-spin text-pink-600" />}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track, fulfill, print dispatch slips, and filter verified customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleExport(false)}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download size={15} />
            Export CSV
          </button>

          {stats.unpaid > 0 && (
            <button
              onClick={handleDeleteAllPending}
              disabled={isDeletingPending}
              className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl hover:bg-rose-100 transition-all flex items-center gap-1.5"
              title="Clean up unpaid checkout attempts"
            >
              {isDeletingPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Clear Pending ({stats.unpaid})
            </button>
          )}
        </div>
      </div>

      {/* 2. Summary KPI Metric Cards (Interactive quick filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Orders */}
        <button
          onClick={() => updateFilter({ payment: "ALL", status: "ALL" })}
          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
            activePayment === "ALL" && activeStatus === "ALL"
              ? "bg-gray-900 text-white border-gray-900 shadow-md"
              : "bg-white text-gray-800 border-gray-100 shadow-xs"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Orders</p>
          <p className="text-xl sm:text-2xl font-black mt-1">{stats.total}</p>
        </button>

        {/* Paid Orders */}
        <button
          onClick={() => updateFilter({ payment: "PAID" })}
          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
            activePayment === "PAID"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-emerald-50 text-emerald-800 border-emerald-100 shadow-xs"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Paid Orders</p>
          <p className="text-xl sm:text-2xl font-black mt-1">{stats.paid}</p>
        </button>

        {/* Unpaid Orders */}
        <button
          onClick={() => updateFilter({ payment: "UNPAID" })}
          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
            activePayment === "UNPAID"
              ? "bg-amber-600 text-white border-amber-600 shadow-md"
              : "bg-amber-50 text-amber-800 border-amber-100 shadow-xs"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Unpaid / Abandoned</p>
          <p className="text-xl sm:text-2xl font-black mt-1">{stats.unpaid}</p>
        </button>

        {/* Pending Fulfillment */}
        <button
          onClick={() => updateFilter({ status: "PENDING" })}
          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
            activeStatus === "PENDING"
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-blue-50 text-blue-800 border-blue-100 shadow-xs"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pending Status</p>
          <p className="text-xl sm:text-2xl font-black mt-1">{stats.pendingStatus}</p>
        </button>

        {/* Delivered */}
        <button
          onClick={() => updateFilter({ status: "DELIVERED" })}
          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
            activeStatus === "DELIVERED"
              ? "bg-purple-600 text-white border-purple-600 shadow-md"
              : "bg-purple-50 text-purple-800 border-purple-100 shadow-xs"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Delivered</p>
          <p className="text-xl sm:text-2xl font-black mt-1">{stats.delivered}</p>
        </button>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl border bg-pink-50 border-pink-100 text-pink-900 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-pink-500">Verified Revenue</p>
          <p className="text-lg sm:text-xl font-black mt-1 truncate">{formatPrice(stats.revenue)}</p>
        </div>
      </div>

      {/* 3. Search and Multi-Filter Control Hub */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by #MB number, internal ID, customer name, email, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
            />
            {searchInput && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-pink-600 text-white font-bold text-xs rounded-lg hover:bg-pink-700 transition-colors"
              >
                Search
              </button>
            )}
          </form>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Payment Filter */}
            <select
              value={activePayment}
              onChange={(e) => updateFilter({ payment: e.target.value })}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-pink-400"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid Only</option>
              <option value="UNPAID">Unpaid / Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Status Filter */}
            <select
              value={activeStatus}
              onChange={(e) => updateFilter({ status: e.target.value })}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-pink-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            {/* Date Preset Filter */}
            <select
              value={activeExactDate ? "custom" : activeDateRange}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  updateFilter({ dateRange: e.target.value, exactDate: null })
                }
              }}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-pink-400"
            >
              <option value="ALL">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              {activeExactDate && <option value="custom">Specific Date</option>}
            </select>

            {/* Particular Date Picker */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Pick Date:</span>
              <input
                type="date"
                value={activeExactDate}
                onChange={(e) => updateFilter({ exactDate: e.target.value, dateRange: null })}
                className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                title="Select particular order date"
              />
            </div>

            {/* Clear button if active */}
            {isAnyFilterActive && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2.5 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {isAnyFilterActive && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs flex-wrap">
            <span className="text-gray-400 font-semibold">Active:</span>
            {activeSearch && (
              <span className="bg-pink-50 text-pink-700 font-bold px-2.5 py-1 rounded-lg border border-pink-200">
                Search: "{activeSearch}"
              </span>
            )}
            {activePayment !== "ALL" && (
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                Payment: {activePayment}
              </span>
            )}
            {activeStatus !== "ALL" && (
              <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                Status: {activeStatus}
              </span>
            )}
            {activeDateRange !== "ALL" && !activeExactDate && (
              <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-lg border border-purple-200">
                Date: {activeDateRange}
              </span>
            )}
            {activeExactDate && (
              <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1.5">
                <span>Date: {activeExactDate}</span>
                <button
                  onClick={() => updateFilter({ exactDate: null })}
                  className="hover:text-purple-900 text-purple-400"
                  title="Remove date filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <span className="text-gray-400 ml-auto">
              Found {totalOrders} order{totalOrders !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* 4. Bulk Actions Bar (Shown when orders are checked) */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center font-black text-xs">
              {selectedIds.length}
            </span>
            <span className="text-sm font-bold">
              {selectedIds.length} order{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-400 hover:text-white underline ml-2"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openBulkPrint}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Printer size={14} /> Bulk Print Slips
            </button>

            <button
              onClick={() => handleExport(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={14} /> Export Selected
            </button>

            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-2 py-1 bg-transparent text-white text-xs font-bold focus:outline-none"
              >
                <option value="" className="text-gray-900">Change Status...</option>
                <option value="PROCESSING" className="text-gray-900">PROCESSING</option>
                <option value="SHIPPED" className="text-gray-900">SHIPPED</option>
                <option value="DELIVERED" className="text-gray-900">DELIVERED</option>
                <option value="CANCELLED" className="text-gray-900">CANCELLED</option>
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus || isUpdatingBulk}
                className="px-3 py-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-all"
              >
                {isUpdatingBulk ? "Updating..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Orders List / Table */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Package size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {isAnyFilterActive
              ? "Try adjusting or clearing your search filters to find what you're looking for."
              : "No orders placed yet."}
          </p>
          {isAnyFilterActive && (
            <button
              onClick={clearAllFilters}
              className="mt-2 px-4 py-2 bg-pink-50 text-pink-600 font-bold text-xs rounded-xl hover:bg-pink-100 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Desktop & Tablet Table (Hidden on small mobile < 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-400 text-[10px] uppercase font-black tracking-wider">
                    <th className="py-3.5 pl-5 pr-2 w-10">
                      <button onClick={toggleSelectAll} className="p-1 hover:text-pink-600">
                        {allVisibleSelected ? <CheckSquare size={16} className="text-pink-600" /> : <Square size={16} />}
                      </button>
                    </th>
                    <th className="py-3.5 px-3">Order Number</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3">Customer</th>
                    <th className="py-3.5 px-3">Payment</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Items</th>
                    <th className="py-3.5 px-3 text-right">Total</th>
                    <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const isSelected = selectedIds.includes(order.id)
                    const isPaid = order.paymentStatus === "COMPLETED"
                    const hasNote = Boolean(order.customerNote)

                    return (
                      <tr 
                        key={order.id}
                        className={`hover:bg-pink-50/30 transition-colors group ${
                          isSelected ? "bg-pink-50/50" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 pl-5 pr-2">
                          <button onClick={() => toggleSelectOne(order.id)} className="p-1 text-gray-400 hover:text-pink-600">
                            {isSelected ? <CheckSquare size={16} className="text-pink-600" /> : <Square size={16} />}
                          </button>
                        </td>

                        {/* Order Number */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span 
                              onClick={() => setActiveDrawerOrder(order)}
                              className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-black font-mono tracking-tight transition-all hover:scale-105 ${
                                (order.orderNumber || "").replace(/^#/, "").startsWith("MB")
                                  ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              }`}
                            >
                              #{(order.orderNumber || "").replace(/^#/, "")}
                            </span>
                            {hasNote && (
                              <span 
                                title={`Customer Note: ${order.customerNote}`} 
                                className="p-1 text-amber-500 bg-amber-50 rounded-md"
                              >
                                <MessageSquare size={13} />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-3 text-gray-500 font-medium whitespace-nowrap">
                          {formatIST(order.createdAt)}
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-3">
                          <div className="max-w-[180px]">
                            <p className="font-bold text-gray-900 truncate">
                              {order.customerName || "Guest"}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {order.customerPhone || order.customerEmail || "N/A"}
                            </p>
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isPaid ? "bg-emerald-100 text-emerald-700" :
                              order.paymentStatus === "PENDING" ? "bg-amber-100 text-amber-700" :
                              order.paymentStatus === "FAILED" ? "bg-rose-100 text-rose-700" :
                              "bg-purple-100 text-purple-700"
                            }`}>
                              {isPaid ? "Paid" : order.paymentStatus === "PENDING" ? "Unpaid" : order.paymentStatus}
                            </span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                              {order.payment?.paymentMethod === "COD" ? "💵 COD" : "💳 Online"}
                            </p>
                          </div>
                        </td>

                        {/* Order Status */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                        </td>

                        {/* Items */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5 max-w-[200px]">
                            {order.items?.slice(0, 2).map((item: any) => (
                              <div key={item.id} className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100" title={item.product?.name}>
                                {item.product?.images?.[0] && (
                                  <img src={getImageUrl(item.product.images[0].url)} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                            ))}
                            <div className="text-gray-600 font-medium truncate">
                              <span className="font-bold text-gray-900">{order.items?.length || 0}</span> item{(order.items?.length || 0) > 1 ? "s" : ""}
                            </div>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-4 px-3 text-right whitespace-nowrap">
                          <span className="font-black text-sm text-gray-900">
                            {formatPrice(order.total)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-5 pl-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setActiveDrawerOrder(order)}
                              className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                              title="View Details Drawer"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => openSinglePrint(order)}
                              className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                              title="Print Slip"
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout (< 768px) */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => {
              const isSelected = selectedIds.includes(order.id)
              const isPaid = order.paymentStatus === "COMPLETED"
              const hasNote = Boolean(order.customerNote)

              return (
                <div
                  key={order.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-colors ${
                    isSelected ? "border-pink-300 bg-pink-50/20" : "border-gray-100"
                  }`}
                >
                  {/* Top Row: Checkbox, Order #, Status, Price */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSelectOne(order.id)} className="p-1 text-gray-400">
                        {isSelected ? <CheckSquare size={16} className="text-pink-600" /> : <Square size={16} />}
                      </button>
                      <span
                        onClick={() => setActiveDrawerOrder(order)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                          (order.orderNumber || "").replace(/^#/, "").startsWith("MB")
                            ? "bg-pink-100 text-pink-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        #{(order.orderNumber || "").replace(/^#/, "")}
                      </span>
                    </div>

                    <span className="font-black text-base text-gray-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  {/* Customer info & Date */}
                  <div className="flex justify-between items-start text-xs pt-1 border-t border-gray-50">
                    <div>
                      <p className="font-bold text-gray-900">{order.customerName || "Guest Customer"}</p>
                      <p className="text-gray-400 text-[11px]">{order.customerPhone || order.customerEmail || "N/A"}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {formatIST(order.createdAt)}
                    </span>
                  </div>

                  {/* Badges: Payment, Order Status */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        {order.payment?.paymentMethod === "COD" ? "COD" : "Online"}
                      </span>
                      {hasNote && (
                        <span className="text-amber-500 bg-amber-50 p-1 rounded-md" title="Customer Note">
                          <MessageSquare size={12} />
                        </span>
                      )}
                    </div>
                    <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveDrawerOrder(order)}
                      className="flex-1 py-2 bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={14} /> View Details
                    </button>
                    <button
                      onClick={() => openSinglePrint(order)}
                      className="p-2 text-gray-500 hover:text-pink-600 bg-gray-50 rounded-xl"
                      title="Print Slip"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 6. Pagination Controls */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-600 shadow-xs">
            <div>
              Showing <span className="font-bold text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-bold text-gray-900">{Math.min(currentPage * pageSize, totalOrders)}</span> of{" "}
              <span className="font-bold text-gray-900">{totalOrders}</span> orders
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => updateFilter({ page: String(currentPage - 1) })}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <span className="px-3 py-1 bg-pink-50 text-pink-600 font-bold rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => updateFilter({ page: String(currentPage + 1) })}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 7. Drawer and Print Modals */}
      <OrderDetailDrawer
        order={activeDrawerOrder}
        isOpen={Boolean(activeDrawerOrder)}
        onClose={() => setActiveDrawerOrder(null)}
        onPrint={(ord) => {
          setPrintOrders([ord])
          setIsPrintModalOpen(true)
        }}
        onStatusUpdated={(id, st) => {
          const target = orders.find(o => o.id === id)
          if (target) target.status = st
        }}
      />

      <OrderPrintModal
        orders={printOrders}
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false)
          setPrintOrders([])
        }}
      />

    </div>
  )
}
