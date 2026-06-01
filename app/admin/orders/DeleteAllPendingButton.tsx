"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteAllPendingOrders } from "./actions"

export default function DeleteAllPendingButton() {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL PENDING orders? This action cannot be undone and will permanently erase all unconfirmed/abandoned carts.")) return

    setIsDeleting(true)
    const result = await deleteAllPendingOrders()
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
    setIsDeleting(false)
  }

  return (
    <button
      onClick={handleDeleteAll}
      disabled={isDeleting}
      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-bold transition-all disabled:opacity-50 text-sm border border-red-200"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      Delete All Pending
    </button>
  )
}
