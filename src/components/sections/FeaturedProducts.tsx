// src/components/sections/FeaturedProducts.tsx

"use client"

import { motion } from "framer-motion"
import { ProductCard } from "@/components/product/ProductCard"
import { Product } from "@/types"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface FeaturedProductsProps {
  products: Product[]
  title?: string
  description?: string
}

export function FeaturedProducts({
  products,
  title = "Featured Collection",
  description = "Handpicked pieces for your aesthetic",
}: FeaturedProductsProps) {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-sm font-medium text-pink-500 tracking-widest mb-3 uppercase">
            Trending Now
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">{description}</p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {products.slice(0, 8).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-10 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-pink-600 transition-all shadow-sm group"
          >
            View All Products
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Infinite Marquee of Products */}
      <div className="relative w-full overflow-hidden py-8 opacity-70 hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdf0f5] via-transparent to-[#fdf0f5] z-10 pointer-events-none w-full" />
        
        <div className="flex w-fit animate-marquee">
          {/* Double the array for seamless infinite looping */}
          {[...products, ...products].slice(0, 30).map((product, idx) => (
            product.images?.[0] && (
              <div key={`${product.id}-${idx}`} className="w-32 h-32 md:w-44 md:h-44 flex-shrink-0 mx-3 relative rounded-2xl overflow-hidden bg-white shadow-sm border border-pink-100/50">
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.name}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  )
}
