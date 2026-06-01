import prisma from "@/lib/prisma"
import { formatPrice } from "@/lib/utils/helpers"
import LogoutButton from "./LogoutButton"
import DeleteOrderButton from "./DeleteOrderButton"
import OrderStatusDropdown from "./OrderStatusDropdown"
import OrderSearchInput from "./OrderSearchInput"

// Force dynamic to always fetch the latest orders
export const dynamic = "force-dynamic"

export default async function AdminOrdersPage({ searchParams }: { searchParams: { search?: string } }) {
  const search = searchParams?.search?.toLowerCase() || ""

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      shippingAddress: true,
      items: {
        include: { 
          product: {
            include: { images: true }
          }
        }
      },
      payment: true
    }
  })

  // Calculate statistics
  const pendingCount = orders.filter(o => o.status === "PENDING").length
  const confirmedCount = orders.filter(o => ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status)).length
  const deliveredCount = orders.filter(o => o.status === "DELIVERED").length

  // Helper to format date in IST (with time)
  const formatIST = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(new Date(date))
  }

  // Filter orders for display based on search term
  const displayedOrders = orders.filter(order => {
    if (!search) return true
    
    const idMatch = order.orderNumber.toLowerCase().includes(search)
    const nameMatch = (order.customerName || "").toLowerCase().includes(search)
    const emailMatch = (order.customerEmail || "").toLowerCase().includes(search)
    const phoneMatch = (order.customerPhone || "").toLowerCase().includes(search)
    
    return idMatch || nameMatch || emailMatch || phoneMatch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard - Recent Orders</h1>
          <div className="flex items-center gap-4">
            <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-lg font-medium">
              Total Orders: {orders.length}
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {/* Total Pending */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Pending Orders</p>
              <h3 className="text-3xl font-black text-amber-700">{pendingCount}</h3>
            </div>
            <div className="p-3 bg-amber-100/50 text-amber-600 rounded-xl text-2xl">⏳</div>
          </div>

          {/* Total Confirmed */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Confirmed Orders</p>
              <h3 className="text-3xl font-black text-blue-700">{confirmedCount}</h3>
            </div>
            <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl text-2xl">📦</div>
          </div>

          {/* Total Delivered */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">Delivered Orders</p>
              <h3 className="text-3xl font-black text-green-700">{deliveredCount}</h3>
            </div>
            <div className="p-3 bg-green-100/50 text-green-600 rounded-xl text-2xl">🎉</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <OrderSearchInput />
          {search && (
            <p className="text-sm text-gray-500 font-medium">
              Found {displayedOrders.length} order{displayedOrders.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {displayedOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            {search ? (
              <p className="text-gray-500 text-lg">No orders found matching "{search}".</p>
            ) : (
              <p className="text-gray-500 text-lg">No orders yet. Wait for customers to start buying! 🚀</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {displayedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 relative group">
                
                {/* Delete Button - Absolute Positioned */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteOrderButton orderId={order.id} />
                </div>

                {/* Order Summary */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm text-gray-500">#{order.orderNumber}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {order.payment?.paymentMethod === 'COD' ? '💵 COD' : '💳 Online'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {order.paymentStatus === 'COMPLETED' ? '✅ Paid' : '⏳ Unpaid / Pending'}
                    </span>
                    <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                    <span className="text-sm text-gray-400">
                      {formatIST(order.createdAt)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Details</h3>
                    <p className="text-sm text-gray-800"><span className="font-medium">Name:</span> {order.customerName || "Guest Customer"}</p>
                    <p className="text-sm text-gray-800"><span className="font-medium">Phone:</span> {order.customerPhone}</p>
                    <p className="text-sm text-gray-800"><span className="font-medium">Email:</span> {order.customerEmail}</p>
                    {order.shippingAddress && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-800">Address: </span>
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img src={item.product.images[0]?.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-gray-400 font-medium">No Image</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.product?.name || "Deleted Product"}</p>
                            {item.selectedVariantName && (
                              <p className="text-pink-600 text-[10px] font-bold uppercase tracking-wider">
                                Variant: {item.selectedVariantName}
                              </p>
                            )}
                            <p className="text-gray-500 text-xs font-medium">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t-2 border-gray-50">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-500 font-medium">Subtotal</span>
                      <span className="font-bold text-gray-900">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-500 font-medium">Shipping</span>
                      <span className="font-bold text-gray-900">{formatPrice(order.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-pink-50/50 p-3 rounded-xl border border-pink-100/50">
                      <span className="font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-black text-pink-600 drop-shadow-sm">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
