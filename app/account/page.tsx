// app/account/page.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, ShoppingBag, MapPin, LogOut } from "lucide-react"

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">(
    "profile"
  )

  // Mock user data
  const userData = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+91 98765 43210",
    joinedDate: "January 2024",
  }

  const orders = [
    {
      id: "1",
      orderNumber: "MB2024001",
      date: "Feb 15, 2024",
      total: "₹2,999",
      status: "Delivered",
      items: 3,
    },
  ]

  const addresses = [
    {
      id: "1",
      name: "Home",
      address: "123 Main St, New Delhi, Delhi 110001",
      isDefault: true,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900">My Account</h1>
          <button className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition">
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Welcome</p>
                  <p className="font-semibold text-gray-900">{userData.name}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "orders", label: "Orders", icon: ShoppingBag },
                  { id: "addresses", label: "Addresses", icon: MapPin },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        setActiveTab(item.id as typeof activeTab)
                      }
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                        activeTab === item.id
                          ? "bg-pink-400 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-8"
              >
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                  Profile Information
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={userData.name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={userData.email}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue={userData.phone}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div className="pt-4">
                    <button className="px-8 py-3 bg-pink-400 text-white font-semibold rounded-lg hover:bg-pink-500 transition">
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                  Order History
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-50 rounded-lg p-6 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.date} • {order.items} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{order.total}</p>
                          <p className="text-sm text-green-600">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold text-gray-900">
                    Saved Addresses
                  </h2>
                  <button className="px-6 py-2 bg-pink-400 text-white font-semibold rounded-lg hover:bg-pink-500 transition">
                    Add Address
                  </button>
                </div>

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {address.name}
                          </p>
                          <p className="text-gray-600 mt-1">{address.address}</p>
                          {address.isDefault && (
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
                            Edit
                          </button>
                          <button className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
