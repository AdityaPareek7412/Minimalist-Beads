// src/components/sections/NewsletterSection.tsx

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowRight } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto glass-card p-10 sm:p-16 rounded-[3rem]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center shadow-lg border border-white/20"
          >
            <Mail className="w-8 h-8 text-fuchsia-400" />
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-md">
            Be the First
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto font-light">
            Subscribe to our newsletter for exclusive drops, special offers, and insider
            aesthetic inspo straight to your inbox.
          </p>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-3 rounded-xl border border-white/20 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 backdrop-blur-md"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          {/* Success Message */}
          {isSubscribed && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-600 font-medium"
            >
              ✓ Thanks for subscribing!
            </motion.p>
          )}

          {/* Privacy Note */}
          <p className="text-sm text-gray-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
