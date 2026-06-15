// src/lib/utils/helpers.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Product, Order } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = "₹"): string {
  if (price === undefined || price === null) return `${currency}0.00`
  return `${currency}${price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (!originalPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
}

export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

export function calculateCartTotal(cartItems: any[]): {
  subtotal: number
  tax: number
  shipping: number
  total: number
} {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.18 // 18% GST
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + tax + shipping

  return {
    subtotal,
    tax,
    shipping,
    total,
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ""))
}

export function getImageUrl(url: string | undefined): string {
  if (!url) return "/images/placeholder.jpg"
  if (url.startsWith("http")) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfka0sdnl"
    const cloudinaryHost = `res.cloudinary.com/${cloudName}`
    
    if (url.includes(cloudinaryHost) && url.includes("/upload/")) {
      let modifiedUrl = url
      if (!url.includes("/q_auto")) {
        modifiedUrl = url.replace("/upload/", "/upload/w_1200,q_auto,f_auto/")
      } else if (!url.includes("w_")) {
        modifiedUrl = url.replace("/upload/q_auto", "/upload/w_1200,q_auto")
      }
      return modifiedUrl.replace(`https://${cloudinaryHost}/`, "/images-cdn/")
    }
    
    if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
      let modifiedUrl = url
      if (!url.includes("/q_auto")) {
        modifiedUrl = url.replace("/upload/", "/upload/w_1200,q_auto,f_auto/")
      } else if (!url.includes("w_")) {
        modifiedUrl = url.replace("/upload/q_auto", "/upload/w_1200,q_auto")
      }
      const match = url.match(/res\.cloudinary\.com\/([^/]+)\//)
      if (match && match[1]) {
        return modifiedUrl.replace(`https://res.cloudinary.com/${match[1]}/`, "/images-cdn/")
      }
    }
    return url
  }
  return `/images/${url}`
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function isOutOfStock(product: Product): boolean {
  return product.stock === 0
}

export function getDiscountPercentage(originalPrice: number, currentPrice: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

export function getImageAlt(productName: string, index: number = 0): string {
  return `${productName} - Image ${index + 1}`
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `MB${timestamp}${random}`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
