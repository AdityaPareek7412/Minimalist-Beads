// src/hooks/useProducts.ts

"use client"

import { useState, useEffect } from "react"
import { Product, FilterOptions } from "@/types"

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  loadMore: () => Promise<void>
}

export function useProducts(filters?: FilterOptions, page: number = 1): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          ...(filters?.categories?.length && { categories: filters.categories.join(",") }),
          ...(filters?.priceRange && {
            minPrice: filters.priceRange[0].toString(),
            maxPrice: filters.priceRange[1].toString(),
          }),
          ...(filters?.sortBy && { sortBy: filters.sortBy }),
          ...(filters?.search && { search: filters.search }),
        })

        const response = await fetch(`/api/products?${queryParams}`)
        if (!response.ok) throw new Error("Failed to fetch products")

        const data = await response.json()
        setProducts(data.products)
        setTotalCount(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters, page])

  const loadMore = async () => {
    // Implement pagination logic
  }

  return {
    products,
    loading,
    error,
    totalCount,
    hasMore: products.length < totalCount,
    loadMore,
  }
}
