// src/components/sections/AestheticStory.tsx

"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function AestheticStory() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <span className="text-pink-500 font-medium tracking-[0.3em] uppercase text-xs mb-6 block">
              The Minimalist Philosophy
            </span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-[1.1]">
              Beauty in the <br /> 
              <span className="italic font-light text-pink-400">Simple Things.</span>
            </h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed max-w-lg font-light">
              At Minimalist Beads, we believe jewelry is a language of the soul. 
              Each bead is hand-picked, each charm is curated, and each chain is 
              designed to tell your unique story. No noise, just pure aesthetic.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-10 py-4 bg-[#2d111a] text-white rounded-full font-semibold hover:bg-pink-600 transition-all group"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 px-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-pink-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 font-medium italic">Joined by 500+ aesthetic lovers</p>
              </div>
            </div>
          </motion.div>

          {/* Visual Elements */}
          <div className="order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              {/* Main Image */}
              <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-pink-100 aspect-[4/5] relative">
                <img 
                  src="https://images.unsplash.com/photo-1611085583191-a3b1a296774e?w=800&h=1000&fit=crop" 
                  alt="Aesthetic Jewelry" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 to-transparent" />
              </div>

              {/* Floating Element 1 */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-pink-50 rounded-full p-4 border border-pink-100 shadow-xl hidden md:block"
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1599643478702-ccff6cb355ef?w=200&h=200&fit=crop" 
                    alt="Detail" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-pink-50 max-w-[180px] hidden md:block"
              >
                <p className="font-cursive text-pink-500 text-xl mb-1">Handmade</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">With Pure Intention</p>
              </motion.div>
            </motion.div>

            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-pink-50/50 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
