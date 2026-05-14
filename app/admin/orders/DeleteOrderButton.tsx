"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete order")
      }
    } catch (err) {
      alert("Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
      title="Delete Order"
    >
      {isDeleting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Trash2 className="w-5 h-5" />
      )}
    </button>
  )
}
