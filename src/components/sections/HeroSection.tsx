// src/components/sections/HeroSection.tsx

"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { ChevronDown, Instagram } from "lucide-react"

export function HeroSection() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">
      {/* 3D Floating Elements Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 right-10 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse-glow"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse-glow"
        />
        
        {/* Decorative 3D Glass Orbs */}
        <motion.div 
          className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full glassmorphism"
          animate={{ y: [-20, 20, -20], rotateX: [0, 180, 360], rotateY: [0, 180, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-[20%] right-[15%] w-24 h-24 rounded-full glassmorphism"
          animate={{ y: [20, -20, 20], rotateX: [360, 180, 0], rotateY: [360, 180, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
        <div className="bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-white/20 shadow-2xl">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-2 glassmorphism text-white text-xs font-bold rounded-full tracking-widest uppercase">
              gen-z aesthetic collection ✨
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 mb-6 leading-tight drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
          >
            Curate Your <br /> Vibe
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md"
          >
            Handcrafted minimalist jewelry and aesthetic accessories. Minimal,
            dreamy, and uniquely you.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Link
            href="/shop"
            className="px-10 py-5 bg-white text-black font-bold rounded-2xl hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 w-full sm:w-auto"
          >
            Shop the Drop
          </Link>
          <a
            href="https://www.instagram.com/minimalistbeads.co?igsh=d3psMDlqeXQxbjdn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-5 glassmorphism text-white font-bold rounded-2xl hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto border border-white/30"
          >
            <Instagram className="w-6 h-6" />
            Follow on IG
          </a>
        </motion.div>

        {/* Floating Charm Decorations */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mt-12"
        >
          <div className="flex justify-center gap-6 max-w-3xl mx-auto">
            {["💎", "🌸", "✨", "🎀", "💜"].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.3, rotate: 15, y: -10 }}
                className="w-16 h-16 rounded-2xl glassmorphism flex items-center justify-center text-3xl shadow-lg cursor-pointer"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-white/50" />
        </motion.div>
      </div>
    </section>
  )
}
