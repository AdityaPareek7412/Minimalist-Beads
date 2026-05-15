// src/components/sections/WhyChooseUs.tsx

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Truck, Leaf, Heart, Sparkles } from "lucide-react"

export function WhyChooseUs() {
  const [settings, setSettings] = useState({ freeShippingLimit: 500 })

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {})
  }, [])

  const features = [
    {
      icon: Truck,
      title: "Fast Shipping",
      description: `Free delivery on orders above ₹${settings.freeShippingLimit}. Delivered in 3-5 business days.`,
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainable packaging and ethical sourcing of all materials.",
    },
    {
      icon: Heart,
      title: "Handmade with Love",
      description: "Each piece is carefully crafted by skilled artisans.",
    },
    {
      icon: Sparkles,
      title: "Premium Quality",
      description: "Only the finest materials used in our collections.",
    },
  ]

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative z-10 bg-sage-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-sm font-medium text-sage-500 tracking-widest mb-3 uppercase">
            Why Minimalist Beads
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Crafted for You
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group p-8 bg-white rounded-2xl shadow-sm border border-sage-100 hover:shadow-md hover:border-pink-200 transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 mx-auto mb-6 bg-pink-50 rounded-full flex items-center justify-center group-hover:bg-pink-100 transition border border-pink-100"
                >
                  <Icon className="w-7 h-7 text-pink-500" />
                </motion.div>
                <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
