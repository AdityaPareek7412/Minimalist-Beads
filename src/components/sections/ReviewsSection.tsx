"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Quote, CheckCircle, X, Send } from "lucide-react"

const STATIC_REVIEWS = [
  {
    id: "static-1",
    name: "Isha V.",
    comment: "The quality is absolutely insane! I've been wearing my custom charm bracelet every day and it still looks brand new. Best Gen-Z jewelry brand out there! ✨",
    rating: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: "static-2",
    name: "Ananya R.",
    comment: "Literally obsessed with the soft gothic vibe. The packaging was so aesthetic, it felt like a luxury gift to myself. 🎀",
    rating: 5,
    createdAt: new Date().toISOString()
  }
]

export function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    comment: ""
  })

  useEffect(() => {
    fetch("/api/general-reviews")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews([...STATIC_REVIEWS, ...data])
        } else {
          setReviews(STATIC_REVIEWS)
        }
      })
      .catch(() => setReviews(STATIC_REVIEWS))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/general-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setIsModalOpen(false)
          setSubmitted(false)
          setFormData({ name: "", rating: 5, comment: "" })
        }, 3000)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
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
                "{review.comment}"
              </p>

              <div className="pt-6 border-t border-pink-50 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-[#2d111a] flex items-center gap-2">
                    {review.name}
                    <CheckCircle size={14} className="text-green-500" />
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                    Verified Buyer
                  </p>
                </div>
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-[#2d111a] px-10 py-4 rounded-full font-bold hover:bg-pink-50 transition-colors shadow-lg"
            >
              Write a Review
            </button>
          </div>
        </motion.div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#2d111a]/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-pink-50 rounded-full transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>

                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} className="text-pink-500" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#2d111a] mb-2">Thank you!</h3>
                    <p className="text-gray-500">Your review has been submitted for approval 🌸</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-serif font-bold text-[#2d111a] mb-2 text-center">Share the Love</h3>
                    <p className="text-gray-500 text-center mb-8 font-light">Tell us about your experience</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-4">Your Name</label>
                        <input 
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="How should we call you?"
                          className="w-full bg-pink-50/50 border border-pink-100 rounded-2xl px-6 py-4 outline-none focus:border-pink-400 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-4">Rating</label>
                        <div className="flex gap-2 ml-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormData({...formData, rating: star})}
                              className="focus:outline-none transition-transform active:scale-90"
                            >
                              <Star 
                                size={24} 
                                className={star <= formData.rating ? "fill-pink-400 text-pink-400" : "text-pink-100"} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-4">Your Story</label>
                        <textarea 
                          required
                          rows={4}
                          value={formData.comment}
                          onChange={(e) => setFormData({...formData, comment: e.target.value})}
                          placeholder="Tell us about your beautiful purchase..."
                          className="w-full bg-pink-50/50 border border-pink-100 rounded-2xl px-6 py-4 outline-none focus:border-pink-400 transition resize-none"
                        />
                      </div>

                      <button 
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#2d111a] text-white py-5 rounded-2xl font-bold hover:bg-pink-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-pink-900/10 disabled:opacity-50"
                      >
                        {loading ? "Sending..." : "Submit Review"}
                        <Send size={18} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
