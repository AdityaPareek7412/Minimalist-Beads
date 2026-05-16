"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { ChevronDown, Instagram, Sparkles, Heart, Star } from "lucide-react"

const FloatingElement = ({ children, delay = 0, duration = 6, className = "" }: { children: React.ReactNode, delay?: number, duration?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4],
      y: [0, -20, 0],
      x: [0, 10, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className={`absolute pointer-events-none ${className}`}
  >
    {children}
  </motion.div>
)

export function HeroSection() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 100])
  const y2 = useTransform(scrollY, [0, 500], [0, -50])

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-[#fdf0f5]">
      {/* Soft Background Blobs & Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-pink-200 rounded-full filter blur-[120px] opacity-40"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-rose-100 rounded-full filter blur-[100px] opacity-50"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-50 rounded-full filter blur-[150px] opacity-30" />
      </div>

      {/* Aesthetic Floating Elements */}
      <FloatingElement className="top-[15%] left-[10%] text-pink-300" delay={0}>
        <Sparkles size={24} />
      </FloatingElement>
      <FloatingElement className="top-[25%] right-[15%] text-rose-300" delay={1} duration={7}>
        <Heart size={20} fill="currentColor" />
      </FloatingElement>
      <FloatingElement className="bottom-[20%] left-[15%] text-purple-300" delay={2} duration={8}>
        <Star size={18} fill="currentColor" />
      </FloatingElement>
      <FloatingElement className="top-[40%] left-[5%] text-pink-200 opacity-40" delay={0.5} duration={10}>
        <div className="w-12 h-12 rounded-full bg-pink-300 blur-xl" />
      </FloatingElement>
      <FloatingElement className="bottom-[30%] right-[10%] text-pink-400" delay={1.5}>
        <span className="text-2xl">🎀</span>
      </FloatingElement>
      <FloatingElement className="top-[10%] right-[30%] text-pink-200" delay={3} duration={12}>
        <span className="text-xl">✨</span>
      </FloatingElement>
      <FloatingElement className="bottom-[10%] left-[40%] text-rose-200" delay={4} duration={9}>
        <span className="text-lg">☁️</span>
      </FloatingElement>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
        {/* Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <span className="inline-block px-6 py-2.5 bg-white/60 backdrop-blur-md text-pink-500 text-[10px] font-bold rounded-full tracking-[0.3em] uppercase border border-pink-100 shadow-sm">
            ✨ Collected with soul
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6"
        >
          <span className="block text-6xl sm:text-8xl lg:text-9xl font-serif font-bold text-gray-900 leading-[0.9] tracking-tight">
            Collected
          </span>
          <span className="block text-5xl sm:text-7xl lg:text-8xl font-serif font-bold text-gray-900 leading-[0.9] tracking-tight">
            Dreams
          </span>
          <span className="block text-3xl sm:text-4xl lg:text-5xl font-cursive text-pink-400 mt-4 italic">
            for your universe.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base sm:text-lg text-gray-500/80 mb-12 max-w-xl mx-auto leading-relaxed font-light tracking-wide"
        >
          Aesthetic accessories for your internet-era jewelry box. <br className="hidden sm:block" />
          <span className="text-pink-400/70 font-medium italic">Tiny obsessions</span>, made for your aesthetic.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20"
        >
          <Link
            href="/shop"
            className="group relative px-12 py-4 bg-gray-900 text-white font-bold rounded-full overflow-hidden transition-all duration-500 w-full sm:w-auto text-center text-xs uppercase tracking-[0.2em]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Explore Pieces <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-pink-500 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500" />
          </Link>
          
          <a
            href="https://www.instagram.com/minimalistbeads.co?igsh=d3psMDlqeXQxbjdn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-white/40 backdrop-blur-md text-gray-600 font-bold rounded-full hover:bg-white/80 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto border border-pink-100 text-xs uppercase tracking-[0.2em]"
          >
            <Instagram className="w-4 h-4" />
            Follow Vibe on IG
          </a>
        </motion.div>

        {/* Mini Charms Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="hidden sm:block"
        >
          <div className="flex justify-center gap-6">
            {["💎", "🌸", "🎀", "✨", "🐈"].map((emoji, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-xl shadow-sm border border-white/20"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30"
        >
          <ChevronDown className="w-6 h-6 text-pink-400" />
        </motion.div>
      </div>
    </section>
  )
}

import { ArrowRight } from "lucide-react"
