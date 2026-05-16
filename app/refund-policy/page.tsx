// app/refund-policy/page.tsx

import { ShieldCheck, Video, Phone, Instagram } from "lucide-react"

export const metadata = {
  title: "Refund Policy - Minimalist Beads",
  description: "Our simple and transparent refund policy at Minimalist Beads.",
}

export default function RefundPolicy() {
  return (
    <div className="bg-[#fdf0f5] min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2d111a] mb-4">Refund Policy</h1>
          <p className="font-cursive text-pink-600 text-xl">Simple. Transparent. Fair.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-pink-100 overflow-hidden border border-pink-50">
          <div className="p-8 md:p-12 space-y-10">
            {/* Introduction */}
            <section>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                At minimalist beads, we like keeping things simple and transparent.
                Since we work on retails and manage things single handily, we don’t accept returns or exchanges.
              </p>
            </section>

            {/* Damaged or Missing Items */}
            <section className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#2d111a]">Damaged or Missing Items</h2>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                If something arrives damaged or an item is missing, don’t worry — just reach out to us!
                We’ll either refund the amount or add a replacement in your next order — whichever works best for you.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a 
                  href="tel:+917357814309" 
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-pink-100 hover:shadow-md transition"
                >
                  <Phone size={20} className="text-pink-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Call / WhatsApp</p>
                    <p className="font-bold text-[#2d111a]">7357814309</p>
                  </div>
                </a>
                <a 
                  href="https://www.instagram.com/minimalistbeads.co" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-pink-100 hover:shadow-md transition"
                >
                  <Instagram size={20} className="text-pink-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Direct Message</p>
                    <p className="font-bold text-[#2d111a]">@minimalistbeads.co</p>
                  </div>
                </a>
              </div>
            </section>

            {/* Mandatory Unboxing */}
            <section className="bg-[#2d111a] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 text-pink-400">
                  <Video size={24} />
                  <h2 className="text-2xl font-serif font-bold">Important Requirement</h2>
                </div>
                <p className="text-pink-100 leading-relaxed mb-4">
                  Please note, an <span className="text-white font-bold underline underline-offset-4 decoration-pink-500 text-lg">unboxing video is required</span> for all damage or missing item claims.
                </p>
                <p className="text-pink-100/80 text-sm">
                  This helps us verify and resolve the issue quickly. No return or refund will be processed without a proper unboxing video.
                </p>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Video size={160} />
              </div>
            </section>

            {/* Limitations */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-[#2d111a] mb-4">Limitations</h2>
              <p className="text-gray-700 leading-relaxed">
                As we operate on low margins, re-shipping single items isn’t always possible, but we’ll
                always make sure you’re taken care of 💛
              </p>
            </section>
          </div>
        </div>
        
        <div className="mt-12 text-center text-gray-500 text-sm">
          Last updated: May 2024
        </div>
      </div>
    </div>
  )
}
