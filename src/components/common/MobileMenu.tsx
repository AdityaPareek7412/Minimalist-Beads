// src/components/common/MobileMenu.tsx

"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { X, Instagram, Mail, Phone, ChevronRight, Sparkles } from "lucide-react"
import { Portal } from "./Portal"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const EXPLORE_LINKS = [
  { name: "All Products", href: "/shop" },
  { name: "New Arrivals", href: "/shop" },
  { name: "Trending", href: "/shop" },
  { name: "Sale", href: "/shop" },
]

const SUPPORT_LINKS = [
  { name: "Contact Us", href: "/contact" },
  { name: "Shipping Info", href: "/shipping-policy" },
  { name: "Returns & Refunds", href: "/refund-policy" },
  { name: "FAQ", href: "/faq" },
  { name: "Terms & Services", href: "/terms" },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const sidebarVariants = {
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  }

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  }

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  }

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={backdropVariants}
              onClick={onClose}
              className="fixed inset-0 bg-[#2d111a]/60 backdrop-blur-sm z-[9998]"
            />

            {/* Sidebar */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#2b0013] text-white z-[9999] shadow-2xl flex flex-col"
            >
              {/* Header within Sidebar */}
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <span className="font-serif font-bold text-xl tracking-tight">MinimalistBeads</span>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
                >
                  <X size={20} className="text-pink-200" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar">
                {/* Explore Section */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-400/60 mb-6">Explore</p>
                  <ul className="space-y-4">
                    {EXPLORE_LINKS.map((link, i) => (
                      <motion.li 
                        key={link.name}
                        custom={i}
                        initial="closed"
                        animate="open"
                        variants={itemVariants}
                      >
                        <Link 
                          href={link.href} 
                          onClick={onClose}
                          className="group flex items-center justify-between py-2 text-lg font-serif hover:text-pink-300 transition-colors"
                        >
                          <span>{link.name}</span>
                          <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-pink-400" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Support Section */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-400/60 mb-6">Support</p>
                  <ul className="space-y-4">
                    {SUPPORT_LINKS.map((link, i) => (
                      <motion.li 
                        key={link.name}
                        custom={i + 4}
                        initial="closed"
                        animate="open"
                        variants={itemVariants}
                      >
                        <Link 
                          href={link.href} 
                          onClick={onClose}
                          className="group flex items-center justify-between py-2 text-base text-pink-100/70 hover:text-white transition-colors"
                        >
                          <span>{link.name}</span>
                          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-pink-400/50" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Socials / Footer within Sidebar */}
                <div className="pt-10 mt-10 border-t border-white/5 space-y-6">
                  <div className="flex gap-4">
                    <a href="https://instagram.com/minimalistbeads.co" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-pink-500 transition-colors">
                      <Instagram size={18} />
                    </a>
                    <a href="mailto:minimalistbeadsco@gmail.com" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-pink-500 transition-colors">
                      <Mail size={18} />
                    </a>
                    <a href="tel:+917357814309" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-pink-500 transition-colors">
                      <Phone size={18} />
                    </a>
                  </div>
                  <p className="text-[10px] text-pink-200/20 leading-relaxed uppercase tracking-widest">
                    &copy; 2024 Minimalist Beads <br /> Handcrafted with Soul
                  </p>
                </div>
              </div>

              {/* Aesthetic Blur Effects */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  )
}
