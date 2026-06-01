"use client"

import { useState } from "react"
import { toggleReviewStatus, deleteReview } from "./actions"
import { CheckCircle, XCircle, Trash2, Star } from "lucide-react"

type ReviewProps = {
  review: {
    id: string
    name: string
    rating: number
    comment: string
    approved: boolean
    createdAt: Date
  }
}

export default function ReviewCard({ review }: ReviewProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await toggleReviewStatus(review.id, review.approved)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return
    setLoading(true)
    await deleteReview(review.id)
    setLoading(false)
  }

  return (
    <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
      review.approved ? "bg-white border-green-100 shadow-sm" : "bg-gray-50 border-gray-200"
    }`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-900">{review.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < review.rating ? "fill-pink-400 text-pink-400" : "fill-gray-200 text-gray-200"} 
                />
              ))}
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
            review.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            {review.approved ? "Live" : "Pending"}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm italic mb-6">"{review.comment}"</p>
        <p className="text-[10px] text-gray-400 font-medium mb-4">
          Submitted on: {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
            review.approved 
              ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >
          {review.approved ? <><XCircle size={16} /> Hide</> : <><CheckCircle size={16} /> Approve</>}
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
