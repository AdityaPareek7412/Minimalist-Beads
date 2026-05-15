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
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto bg-white p-10 sm:p-16 rounded-3xl shadow-sm border border-pink-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 mx-auto mb-6 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100"
          >
            <Mail className="w-7 h-7 text-pink-500" />
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Be the First
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto font-light">
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
              className="flex-1 px-6 py-3.5 rounded-full border border-pink-200 bg-pink-50/30 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
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
          <p className="text-sm text-gray-400 mt-2">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
