"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, Box, LayoutDashboard, LogOut, Ticket, Settings as SettingsIcon } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Skip layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const navItems = [
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Box },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ]

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0">
        <div className="p-8 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
          <span className="font-serif font-bold text-lg text-gray-900 tracking-tight">Minimalist</span>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-pink-50 text-pink-600 shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-pink-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            )
          })}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all mt-10"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
