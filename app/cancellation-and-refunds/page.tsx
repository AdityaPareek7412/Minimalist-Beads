// app/cancellation-and-refunds/page.tsx

import { ShieldCheck, Video, Clock, CreditCard, RotateCcw, MessageSquare, Phone } from "lucide-react"

export const metadata = {
  title: "Cancellation and Refunds Policy - Minimalist Beads",
  description: "Learn about our order cancellation rules, return policy, and refund timelines.",
}

const policies = [
  {
    icon: <Clock className="text-pink-500" size={24} />,
    title: "Order Cancellation",
    content: "Since we begin preparing and curating your orders almost immediately to ensure fast delivery, we only accept cancellation requests made within 1-2 hours of order placement. Once an order is processed, prepared, or handed over to our shipping partner, it cannot be cancelled or modified under any circumstances."
  },
  {
    icon: <RotateCcw className="text-pink-500" size={24} />,
    title: "Returns & Exchanges",
    content: "Because we operate as a highly curated accessories brand and handle orders single-handedly with low margins, we do not support returns or exchanges for change of mind or subjective preferences. Every order is inspected closely before shipment to ensure top-notch quality."
  },
  {
    icon: <ShieldCheck className="text-pink-500" size={24} />,
    title: "Damaged, Defective, or Missing Items",
    content: "If a package arrives visibly damaged, please reject the delivery. If you receive an item that is damaged in transit or find an item missing from your package, please notify us within 7 days of delivery. We will gladly process a full refund or add a free replacement to your next order — whichever is most convenient for you."
  },
  {
    icon: <CreditCard className="text-pink-500" size={24} />,
    title: "Refund Mode & Timelines",
    content: "Once a refund request is approved, the amount will be automatically credited back to your original payment source (UPI, Credit/Debit Card, Netbanking, or Wallet) or processed directly via bank transfer. Please note that approved refunds typically take 5 to 7 business days to reflect in your account, depending on your bank's processing cycles."
  }
]

export default function CancellationAndRefunds() {
  return (
    <div className="bg-[#fdf0f5] min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/60 text-pink-700 text-sm font-semibold tracking-wider uppercase mb-4">
            <RotateCcw size={14} /> Clear & Fair Policies
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2d111a] mb-4">Cancellation & Refunds</h1>
          <p className="font-cursive text-pink-600 text-xl">Our promise to keep things simple.</p>
        </div>

        <div className="space-y-6 mb-12">
          {policies.map((policy, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-6 md:p-8 shadow-md shadow-pink-100 border border-pink-50 hover:border-pink-200 transition-all duration-300 group hover:-translate-y-0.5"
            >
              <div className="flex gap-4 md:gap-6">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                    {policy.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#2d111a] mb-3">{policy.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base font-normal">{policy.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Requirement Banner */}
        <div className="bg-[#2d111a] text-white rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-xl shadow-pink-900/10 mb-12">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white flex-shrink-0 animate-pulse">
              <Video size={30} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold mb-3 text-pink-400">Mandatory Unboxing Video Requirement</h2>
              <p className="text-pink-100 leading-relaxed text-sm md:text-base mb-4 font-normal">
                To claim refunds or replacements for damaged or missing items, an <span className="text-white font-bold underline decoration-pink-500 underline-offset-4">uninterrupted unboxing video</span> is absolutely mandatory.
              </p>
              <p className="text-pink-200/70 text-xs md:text-sm font-normal">
                The video must start BEFORE opening the package and clearly show the shipping label and tracking number. It must be continuous, with no cuts or edits, showcasing the items being taken out for the first time.
              </p>
            </div>
          </div>
          {/* Aesthetic background glow */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Contact Support Segment */}
        <div className="bg-white rounded-3xl p-8 border border-pink-50 shadow-md shadow-pink-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2d111a] font-serif">Have a dispute or claim?</h3>
              <p className="text-sm text-gray-500">Reach out to us directly with your unboxing video.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a 
              href="mailto:minimalistbeadsco@gmail.com" 
              className="px-6 py-3 bg-pink-500 text-white text-center rounded-xl font-semibold hover:bg-pink-400 transition text-sm"
            >
              Email Support
            </a>
            <a 
              href="tel:+917357814309" 
              className="px-6 py-3 bg-pink-50 text-pink-700 text-center rounded-xl font-semibold hover:bg-pink-100 transition border border-pink-100 text-sm"
            >
              Call 7357814309
            </a>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400 text-xs uppercase tracking-widest">
          Last Updated: May 2026 • Minimalist Beads
        </div>
      </div>
    </div>
  )
}
