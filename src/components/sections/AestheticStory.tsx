// src/components/sections/AestheticStory.tsx

"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Heart } from "lucide-react"

export function AestheticStory() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden relative">
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
              The Founder's Story
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-[#2d111a] mb-8 leading-[1.1]">
              Crafting <br /> 
              <span className="italic font-light text-pink-400">Pure Intentions.</span>
            </h2>
            
            <p className="text-gray-500 text-lg mb-10 leading-relaxed max-w-lg font-light">
              "Minimalist Beads started with a simple thought: that beauty shouldn't be loud. 
              It should be felt. As the founder, I personally hand-pick every bead and design 
              every piece to ensure it carries a vibe of peace and elegance."
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-10 py-4 bg-[#2d111a] text-white rounded-full font-semibold hover:bg-pink-600 transition-all group shadow-xl shadow-pink-900/10"
              >
                Shop the Founder's Picks
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                  <Heart size={20} fill="currentColor" />
                </div>
                <span className="text-sm font-serif italic text-gray-400">Handmade with care</span>
              </div>
            </div>
          </motion.div>

          {/* Visual Elements - Owner's Photo */}
          <div className="order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Main Image - Owner */}
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-pink-200 aspect-[4/5] border-8 border-white">
                <img 
                  src="/images/owner.jpg" 
                  alt="Founder of Minimalist Beads" 
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d111a]/40 via-transparent to-transparent" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-lg">
                  <p className="text-[#2d111a] font-serif font-bold text-lg">Aditya Pareek</p>
                  <p className="text-pink-500 text-[10px] font-bold uppercase tracking-widest">Founder & Designer</p>
                </div>
              </div>

              {/* Decorative Detail Circle */}
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-12 w-48 h-48 bg-white rounded-full p-3 shadow-2xl z-20 hidden xl:block border border-pink-50"
              >
                <div className="w-full h-full rounded-full overflow-hidden relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1599643478702-ccff6cb355ef?w=400&h=400&fit=crop" 
                    alt="Detail" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[#2d111a]/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-serif italic">Detail</span>
                  </div>
                </div>
              </motion.div>

              {/* Aesthetic Floating Card */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 -left-12 bg-white p-6 rounded-[2rem] shadow-xl z-20 hidden md:block border border-pink-50 min-w-[200px]"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 bg-sage-50 rounded-lg flex items-center justify-center text-sage-500">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Our Vibe</span>
                </div>
                <p className="text-[#2d111a] font-serif italic text-lg leading-snug">
                  "Every bead tells a story of serenity."
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
