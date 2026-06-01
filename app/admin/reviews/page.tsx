import prisma from "@/lib/prisma"
import ReviewCard from "./ReviewCard"
import LogoutButton from "../orders/LogoutButton"

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  const reviews = await (prisma as any).generalReview.findMany({
    orderBy: { createdAt: "desc" }
  })

  const pendingReviews = reviews.filter((r: any) => !r.approved)
  const approvedReviews = reviews.filter((r: any) => r.approved)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium text-sm">
              Pending: {pendingReviews.length}
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Pending Reviews Section */}
        {pendingReviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              ⏳ Pending Approval
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingReviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* Approved Reviews Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ✅ Live Reviews
          </h2>
          {approvedReviews.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500">No approved reviews yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedReviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
