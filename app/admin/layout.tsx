"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, Box, Ticket, Settings as SettingsIcon, BarChart3, Star, LogOut, Menu, X } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Skip layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Earnings", href: "/admin/earnings", icon: BarChart3 },
    { name: "Products", href: "/admin/products", icon: Box },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ]

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs">M</div>
          <span className="font-serif font-bold text-base text-gray-900 tracking-tight">Minimalist</span>
          <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
            <span className="font-serif font-bold text-base text-gray-900">Minimalist</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-pink-50 text-pink-600 shadow-xs"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-pink-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 flex-shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="p-8 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
          <span className="font-serif font-bold text-lg text-gray-900 tracking-tight">Minimalist</span>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-pink-50 text-pink-600 shadow-xs"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-pink-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
