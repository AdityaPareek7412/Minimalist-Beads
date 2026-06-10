// app/maintenance/page.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"
import { Instagram, Mail, Phone, Heart } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="relative min-h-screen bg-[#fdf0f5] flex items-center justify-center overflow-hidden px-4">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-pink-200/50 blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-rose-200/40 blur-[80px] sm:blur-[120px] pointer-events-none" />

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg bg-white/45 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-xl shadow-pink-100/20"
      >
        {/* Floating Heart / Brand Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="mx-auto w-16 h-16 bg-gradient-to-tr from-pink-400 to-rose-300 rounded-full flex items-center justify-center shadow-lg shadow-pink-200/50 mb-8"
        >
          <Heart className="text-white fill-current animate-pulse" size={24} />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-800 tracking-tight mb-4">
          MinimalistBeads
        </h1>
        <p className="font-cursive text-pink-500 text-2xl mb-6">
          Upgrading Our Magic... ✨
        </p>

        {/* Message */}
        <div className="space-y-4 mb-10 text-gray-600 text-sm leading-relaxed">
          <p>
            We are currently performing scheduled maintenance to restock and improve your shopping experience.
          </p>
          <p className="font-medium text-gray-700">
            We will be back online shortly! Purchases and browsing are temporarily disabled during this time.
          </p>
        </div>

        {/* Social / Contact Grid */}
        <div className="border-t border-white/40 pt-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Get in touch with us
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.instagram.com/minimalistbeads.co?igsh=d3psMDlqeXQxbjdn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/60 hover:bg-pink-400 hover:text-white rounded-full flex items-center justify-center text-gray-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5 border border-white"
            >
              <Instagram size={20} />
            </a>
            <a
              href="mailto:minimalistbeadsco@gmail.com"
              className="w-11 h-11 bg-white/60 hover:bg-pink-400 hover:text-white rounded-full flex items-center justify-center text-gray-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5 border border-white"
            >
              <Mail size={20} />
            </a>
            <a
              href="tel:+917357814309"
              className="w-11 h-11 bg-white/60 hover:bg-pink-400 hover:text-white rounded-full flex items-center justify-center text-gray-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5 border border-white"
            >
              <Phone size={20} />
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-[10px] text-gray-400">
          &copy; 2026 Minimalist Beads. Handcrafted with love.
        </div>
      </motion.div>
    </div>
  )
}
