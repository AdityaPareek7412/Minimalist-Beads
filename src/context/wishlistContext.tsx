"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Product } from "@/types"

interface WishlistContextType {
  wishlistItems: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("wishlist")
    if (saved) {
      setWishlistItems(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems))
  }, [wishlistItems])

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((p) => p.id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((p) => p.id === productId)
  }

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
