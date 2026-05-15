// src/components/sections/HeroSection.tsx

"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { ChevronDown, Instagram } from "lucide-react"

export function HeroSection() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 100])

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-[#fdf0f5]">
      {/* Soft Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-10 right-0 w-[500px] h-[500px] bg-pink-200 rounded-full filter blur-[120px] opacity-40 animate-pulse-glow"
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-100 rounded-full filter blur-[100px] opacity-50 animate-pulse-glow"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-100 rounded-full filter blur-[80px] opacity-30" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <span className="inline-block px-6 py-2.5 bg-white/70 backdrop-blur-sm text-pink-600 text-xs font-semibold rounded-full tracking-widest uppercase border border-pink-200/60 shadow-sm">
            ✨ Handcrafted with love
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="mb-4"
        >
          <span className="block text-5xl sm:text-7xl lg:text-8xl font-serif font-bold text-gray-900 leading-tight">
            Little Things
          </span>
          <span className="block text-4xl sm:text-5xl lg:text-6xl font-cursive text-pink-500 mt-2">
            That Mean Everything.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Handcrafted minimalist jewelry and aesthetic accessories.
          Minimal, dreamy, and uniquely you.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link
            href="/shop"
            className="px-10 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-pink-600 hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-center"
          >
            Explore Pieces →
          </Link>
          <a
            href="https://www.instagram.com/minimalistbeads.co?igsh=d3psMDlqeXQxbjdn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-full hover:bg-white hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto border border-pink-200"
          >
            <Instagram className="w-5 h-5" />
            Follow on IG
          </a>
        </motion.div>

        {/* Floating Charm Decorations */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mt-8"
        >
          <div className="flex justify-center gap-4 max-w-3xl mx-auto">
            {["💎", "🌸", "✨", "🎀", "💜"].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.2, y: -5 }}
                className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-2xl shadow-sm cursor-pointer border border-pink-100 hover:border-pink-300 hover:shadow-md transition-all"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-7 h-7 text-pink-300" />
        </motion.div>
      </div>
    </section>
  )
}
