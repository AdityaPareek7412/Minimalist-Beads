// src/context/cartContext.tsx

"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { CartItem, Product, ProductVariant } from "@/types"

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, quantity: number, selectedVariant?: ProductVariant) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((product: Product, quantity: number, selectedVariant?: ProductVariant) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === product.id && item.selectedVariant?.id === selectedVariant?.id
      )

      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id && item.selectedVariant?.id === selectedVariant?.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [
        ...prevCart,
        {
          id: `${product.id}-${selectedVariant?.id || "default"}-${Date.now()}`,
          userId: "",
          productId: product.id,
          product,
          quantity,
          selectedVariant,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
    })
  }, [])

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId))
  }, [])

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = item.selectedVariant?.price ?? item.product?.price ?? 0
      return total + price * item.quantity
    }, 0)
  }, [cart])

  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }, [cart])

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
