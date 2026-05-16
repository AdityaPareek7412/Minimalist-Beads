// src/components/sections/ReviewsSection.tsx
"use client"
import { motion } from "framer-motion"
import { Star, Quote, CheckCircle } from "lucide-react"

const REVIEWS = [
  {
    id: 1,
    name: "Isha V.",
    text: "The quality is absolutely insane! I've been wearing my custom charm bracelet every day and it still looks brand new. Best Gen-Z jewelry brand out there! ✨",
    rating: 5,
    location: "Mumbai",
    date: "2 days ago"
  },
  {
    id: 2,
    name: "Ananya R.",
    text: "Literally obsessed with the soft gothic vibe. The packaging was so aesthetic, it felt like a luxury gift to myself. 🎀",
    rating: 5,
    location: "Delhi",
    date: "1 week ago"
  },
  {
    id: 3,
    name: "Sneha K.",
    text: "The attention to detail in these beads is unmatched. You can really feel the love Sangeeta puts into every piece. Highly recommend! 🌸",
    rating: 5,
    location: "Bangalore",
    date: "3 days ago"
  },
  {
    id: 4,
    name: "Mehak S.",
    text: "Fast shipping and such a cute collection. Finally found a brand that matches my Pinterest aesthetic perfectly! ☁️",
    rating: 5,
    location: "Jaipur",
    date: "5 days ago"
  }
]

export function ReviewsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#2d111a]/[0.02] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100/30 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-100/30 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-pink-500 text-sm font-bold uppercase tracking-[0.3em] mb-4 block">
              Our Community
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#2d111a] mb-6">
              Loved by <span className="italic font-light text-pink-400">You.</span>
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-pink-400 text-pink-400" />
              ))}
            </div>
            <p className="text-gray-500 font-light">Join 500+ happy customers</p>
          </motion.div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-pink-900/5 border border-pink-100/50 flex flex-col relative group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#2d111a] text-white rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                <Quote size={18} />
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={12} className="fill-pink-400 text-pink-400" />
                ))}
              </div>

              <p className="text-gray-600 font-light leading-relaxed mb-8 flex-1 italic">
                "{review.text}"
              </p>

              <div className="pt-6 border-t border-pink-50 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-[#2d111a] flex items-center gap-2">
                    {review.name}
                    <CheckCircle size={14} className="text-green-500" />
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                    Verified Buyer • {review.location}
                  </p>
                </div>
                <span className="text-[10px] text-pink-300 font-medium">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 bg-[#2d111a] rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-serif text-white mb-6">
              Have something beautiful to say?
            </h3>
            <button className="bg-white text-[#2d111a] px-10 py-4 rounded-full font-bold hover:bg-pink-50 transition-colors shadow-lg">
              Write a Review
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
