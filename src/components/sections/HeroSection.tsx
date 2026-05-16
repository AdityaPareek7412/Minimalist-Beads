"use client"

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import Link from "next/link"
import { ChevronDown, Instagram, Sparkles, Heart, Star, Flower2 } from "lucide-react"
import { useState, useEffect } from "react"

// Luxury Magnetic Button Component
const MagneticButton = ({ children, className = "", href = "#" }: { children: React.ReactNode, className?: string, href?: string }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.35)
    y.set((e.clientY - centerY) * 0.35)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} className={`relative inline-flex items-center justify-center px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.25em] transition-all duration-300 shadow-sm hover:shadow-pink-200/50 ${className}`}>
        {children}
      </Link>
    </motion.div>
  )
}

// Aesthetic Floating Element
const FloatingCharm = ({ children, delay = 0, duration = 8, xRange = [0, 15], yRange = [0, -25], className = "" }: { children: React.ReactNode, delay?: number, duration?: number, xRange?: number[], yRange?: number[], className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [0.3, 0.7, 0.3],
      y: yRange,
      x: xRange,
      rotate: [0, 10, -10, 0]
    }}
    transition={{ 
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className={`absolute pointer-events-none z-0 ${className}`}
  >
    {children}
  </motion.div>
)

export function HeroSection() {
  const { scrollY } = useScroll()
  const yBg = useTransform(scrollY, [0, 1000], [0, 200])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-[#fdf0f5] selection:bg-pink-100 selection:text-pink-600">
      {/* Premium Dreamy Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div style={{ y: yBg }} className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-pink-200/40 rounded-full blur-[140px]" />
        <motion.div style={{ y: yBg }} className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] bg-rose-100/50 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-50/40 rounded-full blur-[160px]" />
      </div>

      {/* Curated Aesthetic Floating Elements */}
      <FloatingCharm className="top-[12%] left-[8%] text-pink-300" delay={0} duration={10}>
        <Sparkles size={28} strokeWidth={1} />
      </FloatingCharm>
      <FloatingCharm className="top-[22%] right-[12%] text-pink-400/60" delay={1} duration={12} xRange={[0, -20]}>
        <span className="text-3xl">🎀</span>
      </FloatingCharm>
      <FloatingCharm className="bottom-[18%] left-[12%] text-rose-300" delay={2} duration={9} yRange={[0, -35]}>
        <Flower2 size={24} strokeWidth={1} />
      </FloatingCharm>
      <FloatingCharm className="top-[45%] left-[4%] text-pink-200/40" delay={0.5} duration={14}>
        <div className="w-16 h-16 rounded-full bg-pink-300 blur-2xl" />
      </FloatingCharm>
      <FloatingCharm className="bottom-[28%] right-[8%] text-rose-400/50" delay={1.5} duration={11} xRange={[0, -15]}>
        <Heart size={22} fill="currentColor" strokeWidth={0} />
      </FloatingCharm>
      <FloatingCharm className="top-[8%] right-[28%] text-pink-200" delay={3} duration={15}>
        <span className="text-2xl">✨</span>
      </FloatingCharm>
      <FloatingCharm className="bottom-[8%] left-[38%] text-purple-200/80" delay={4} duration={13}>
        <Star size={20} fill="currentColor" strokeWidth={0} />
      </FloatingCharm>
      <FloatingCharm className="top-[18%] left-[25%] text-rose-200/60" delay={5} duration={16}>
        <span className="text-2xl">🌸</span>
      </FloatingCharm>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-32">
        {/* Aesthetic Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-10"
        >
          <span className="inline-block px-8 py-3 bg-white/40 backdrop-blur-xl text-pink-500 text-[9px] font-black rounded-full tracking-[0.4em] uppercase border border-white/50 shadow-sm">
            Internet era luxury
          </span>
        </motion.div>

        {/* Main Emotional Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-10 relative"
        >
          <motion.h1 
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl sm:text-9xl lg:text-[10rem] font-serif font-bold text-[#2d111a] leading-[0.85] tracking-tight mb-4"
          >
            Wearable <br /> 
            <span className="relative">
              Dreams
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 h-[2px] bg-pink-200/50"
              />
            </span>
          </motion.h1>
          
          <motion.span 
            initial={{ opacity: 0, x: -20, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: -5 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="absolute -top-4 right-0 sm:right-[15%] text-4xl sm:text-6xl font-cursive text-pink-400 italic"
          >
            for softer souls
          </motion.span>
        </motion.div>

        {/* Cinematic Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-base sm:text-xl text-gray-500/90 mb-14 max-w-2xl mx-auto leading-relaxed font-light tracking-wide px-4"
        >
          Curating your Pinterest board essentials into wearable memories. <br className="hidden sm:block" />
          <span className="text-pink-400/80 font-medium">Tiny details, main character energy.</span>
        </motion.p>

        {/* Luxury CTA's */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24"
        >
          <MagneticButton 
            href="/shop" 
            className="bg-[#2d111a] text-white hover:bg-pink-600 shadow-xl shadow-pink-900/10 min-w-[220px]"
          >
            Shop Collection
          </MagneticButton>
          
          <MagneticButton 
            href="/about" 
            className="bg-white/40 backdrop-blur-xl text-gray-600 border border-white/60 hover:bg-white/80 min-w-[220px]"
          >
            Explore Aesthetic
          </MagneticButton>
        </motion.div>

        {/* Aesthetic Mini Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5, duration: 2 }}
          className="hidden lg:flex justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700"
        >
          <div className="w-[1px] h-12 bg-pink-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-400">Pinterest core</p>
          <div className="w-[1px] h-12 bg-pink-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-400">Main Character vibe</p>
          <div className="w-[1px] h-12 bg-pink-200" />
        </motion.div>

        {/* Floating Background Sparkles (Particles) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [0.5, 1, 0.5],
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25]
            }}
            transition={{ 
              duration: 4 + Math.random() * 4, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
            className="absolute hidden sm:block w-1.5 h-1.5 bg-pink-300 rounded-full blur-[1px]"
            style={{ 
              top: `${Math.random() * 80 + 10}%`, 
              left: `${Math.random() * 80 + 10}%` 
            }}
          />
        ))}

        {/* Scroll Reveal */}
        <motion.div
          style={{ opacity }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-pink-300">Scroll</span>
            <ChevronDown className="w-5 h-5 text-pink-300" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
