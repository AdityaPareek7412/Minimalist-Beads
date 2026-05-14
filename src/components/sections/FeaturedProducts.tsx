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
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-bold text-fuchsia-500 tracking-widest mb-4 uppercase">
            TRENDING NOW
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-md">
            {title}
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light">{description}</p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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
          className="text-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(236,72,153,0.4)] group"
          >
            View All Products
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
