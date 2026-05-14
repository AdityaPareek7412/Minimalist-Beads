import { PrismaClient } from "@prisma/client"
import { formatPrice } from "@/lib/utils/helpers"
import LogoutButton from "./LogoutButton"

const prisma = new PrismaClient()

// Force dynamic to always fetch the latest orders
export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      shippingAddress: true,
      items: {
        include: { product: true }
      },
      payment: true
    }
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

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-500 text-lg">No orders yet. Wait for customers to start buying! 🚀</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
                
                {/* Order Summary */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-500">#{order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment?.paymentMethod === 'COD' ? '💵 COD' : '💳 Online Payment'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Details</h3>
                    <p className="text-sm text-gray-800"><span className="font-medium">Name:</span> {order.customerName}</p>
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
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img src={item.product.images[0]?.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-400">No img</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium text-gray-900">{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span>{formatPrice(order.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-lg">
                      <span>Total Amount</span>
                      <span className="text-pink-600">{formatPrice(order.total)}</span>
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
