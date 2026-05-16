// app/admin/reviews/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Trash2, Star, CheckCircle, XCircle, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews")
      const data = await res.json()
      if (Array.isArray(data)) setReviews(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return
    try {
      const res = await fetch(`/api/general-reviews/${id}`, { method: "DELETE" })
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id))
      }
    } catch (error) {
      alert("Failed to delete review")
    }
  }

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/general-reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !currentStatus })
      })
      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, approved: !currentStatus } : r))
      }
    } catch (error) {
      alert("Failed to update status")
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d111a]"></div>
    </div>
  )

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2d111a]">Customer Reviews</h1>
          <p className="text-gray-500 mt-1">Manage and moderate site-wide testimonials</p>
        </div>
        <div className="bg-pink-50 px-4 py-2 rounded-full border border-pink-100">
          <span className="text-pink-600 font-bold">{reviews.length}</span>
          <span className="text-pink-400 text-sm ml-2 font-medium uppercase tracking-widest">Total Reviews</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <Clock size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">No reviews found yet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              layout
              key={review.id}
              className={`bg-white p-6 rounded-3xl border transition-all ${
                review.approved ? "border-green-100 shadow-sm" : "border-pink-100 shadow-lg shadow-pink-900/5"
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif font-bold text-xl text-[#2d111a]">{review.name}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? "fill-pink-400 text-pink-400" : "text-gray-100"} 
                        />
                      ))}
                    </div>
                    {review.approved ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full uppercase tracking-widest">
                        <CheckCircle size={10} /> Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full uppercase tracking-widest">
                        <Clock size={10} /> Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed">"{review.comment}"</p>
                  <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
                    Submitted on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleApproval(review.id, review.approved)}
                    className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                      review.approved 
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                        : "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-900/10"
                    }`}
                  >
                    {review.approved ? "Hide Review" : "Approve & Show"}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title="Delete Review"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
