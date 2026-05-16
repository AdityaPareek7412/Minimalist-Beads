// src/components/sections/AestheticStory.tsx

"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Heart } from "lucide-react"

export function AestheticStory() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 rounded-full text-pink-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <Sparkles size={12} />
              From our founder
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-[#2d111a] mb-8 leading-[1.1]">
              Built with <br /> 
              <span className="italic font-light text-pink-400">Never Giving Up.</span>
            </h2>
            
            <div className="space-y-6 mb-10">
              <p className="text-gray-500 text-lg leading-relaxed max-w-lg font-light">
                Welcome to Minimalist beads, a business which built after failing so many times and never giving up. 
                It was once a girlie’s dream who never wanted to do a 9-5 and create something out of the box.
              </p>
              <p className="text-gray-900 font-medium text-lg leading-relaxed max-w-lg font-serif italic">
                "Shop freely, everything is handpicked and chose by founder."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-10 py-4 bg-[#2d111a] text-white rounded-full font-semibold hover:bg-pink-600 transition-all group shadow-xl shadow-pink-900/10"
              >
                Explore Sangeeta's Picks
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                  <Heart size={20} fill="currentColor" />
                </div>
                <span className="text-sm font-serif italic text-gray-400">Thoughtfully Curated Accessories</span>
              </div>
            </div>
          </motion.div>

          {/* Visual Elements - Owner's Photo */}
          <div className="order-1 lg:order-2 relative">
            {/* Background Watermark */}
            <div className="absolute -top-10 -left-20 text-[10rem] font-serif font-black text-pink-50/10 select-none pointer-events-none uppercase tracking-widest hidden xl:block">
              Minimalist
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative w-full h-full"
            >
              {/* Main Image - Aesthetic Craftsmanship Photo */}
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-pink-200 aspect-[4/5] w-full border-8 border-white bg-pink-50 min-h-[400px]">
                <img 
                  src="/images/craftsmanship.jpg" 
                  alt="Minimalist Beads Craftsmanship" 
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d111a]/40 via-transparent to-transparent" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 bg-white/90 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 rounded-2xl border border-white/20 shadow-lg z-20">
                  <p className="text-[#2d111a] font-serif font-bold text-base md:text-lg">Sangeeta🌸</p>
                  <p className="text-pink-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Founder & Visionary</p>
                </div>
              </div>

              {/* Decorative Detail Circle - Sangeeta's Photo */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-2 md:-top-16 md:-right-12 w-32 h-32 md:w-48 md:h-48 xl:w-56 xl:h-56 aspect-square bg-white rounded-full p-2 md:p-4 shadow-2xl z-[30] border border-pink-50 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner">
                  <img 
                    src="/images/sangeeta.jpg" 
                    alt="Sangeeta - Founder" 
                    className="w-full h-full object-cover block"
                    loading="eager"
                  />
                </div>
              </motion.div>

              {/* Floating Aesthetic Beads */}
              <motion.div
                animate={{ x: [0, 10, 0], y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -left-8 w-12 h-12 bg-pink-100 rounded-full blur-[1px] opacity-60 z-20 hidden lg:block"
              />
              <motion.div
                animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 -right-6 w-8 h-8 bg-rose-100 rounded-full blur-[1px] opacity-40 z-20 hidden lg:block"
              />

              {/* Aesthetic Floating Card */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-20 -left-40 bg-white p-6 rounded-[2rem] shadow-xl z-20 hidden md:block border border-pink-50 min-w-[200px]"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 bg-sage-50 rounded-lg flex items-center justify-center text-sage-500">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Our Vibe</span>
                </div>
                <p className="text-[#2d111a] font-serif italic text-lg leading-snug">
                  "Every bead is handpicked with soul."
                </p>
              </motion.div>

              {/* Background Shapes */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-pink-50/40 rounded-full blur-[100px] -z-10" />
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-sage-50/30 rounded-full blur-[80px] -z-10" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
