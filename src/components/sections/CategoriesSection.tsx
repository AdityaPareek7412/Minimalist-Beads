// src/components/sections/CategoriesSection.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Category } from "@/types"
import { ArrowRight } from "lucide-react"

interface CategoriesSectionProps {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
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
          <span className="inline-block text-sm font-bold text-fuchsia-400 tracking-widest mb-4 uppercase">
            SHOP BY VIBE
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-md">
            Find Your Style
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-light">
            Browse our curated collections organized by aesthetic
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/shop?category=${category.slug}`}>
                <div className="relative group rounded-3xl overflow-hidden cursor-pointer h-48 md:h-56 glass-card border border-white/10 hover:border-fuchsia-400/50 transition-all duration-300 flex flex-col items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  {/* Content */}
                  <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                    {category.icon}
                  </span>
                  <h3 className="text-white text-lg font-bold text-center px-4 tracking-wide group-hover:text-fuchsia-300 transition-colors">
                    {category.name}
                  </h3>

                  {/* Hover Arrow */}
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-4 right-4 w-8 h-8 bg-fuchsia-500 rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
