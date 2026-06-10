// src/components/common/LayoutWrapper.tsx
"use client"

import React from "react"
import { usePathname } from "next/navigation"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMaintenancePage = pathname === "/maintenance"

  if (isMaintenancePage) {
    return null
  }

  return <>{children}</>
}
