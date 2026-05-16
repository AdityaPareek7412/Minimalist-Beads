// app/contact/page.tsx

import { Phone, Mail, Instagram, MapPin, MessageCircle } from "lucide-react"

export const metadata = {
  title: "Contact Us - Minimalist Beads",
  description: "Get in touch with Minimalist Beads for any queries or support.",
}

export default function ContactUs() {
  return (
    <div className="bg-[#fdf0f5] min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2d111a] mb-4">Contact Us</h1>
          <p className="font-cursive text-pink-600 text-xl">We'd love to hear from you!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <a 
              href="tel:+917357814309"
              className="flex items-center gap-6 p-8 bg-white rounded-3xl shadow-sm border border-pink-50 hover:border-pink-200 transition group"
            >
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Phone size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Call or WhatsApp</p>
                <p className="text-xl font-bold text-[#2d111a]">7357814309</p>
              </div>
            </a>

            <a 
              href="mailto:minimalistbeadsco@gmail.com"
              className="flex items-center gap-6 p-8 bg-white rounded-3xl shadow-sm border border-pink-50 hover:border-pink-200 transition group"
            >
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Mail size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Email Us</p>
                <p className="text-xl font-bold text-[#2d111a]">minimalistbeadsco@gmail.com</p>
              </div>
            </a>

            <div className="flex items-center gap-6 p-8 bg-white rounded-3xl shadow-sm border border-pink-50">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                <MapPin size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Location</p>
                <p className="text-xl font-bold text-[#2d111a]">Jaipur, India</p>
              </div>
            </div>
          </div>

          {/* Social & WhatsApp Direct */}
          <div className="space-y-6">
            <div className="bg-[#2d111a] rounded-[2.5rem] p-10 text-white h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-6">Stay Connected</h2>
                <p className="text-pink-200/80 mb-8 leading-relaxed">
                  The best way to see our new drops and track your order is through our Instagram stories!
                </p>
                
                <a 
                  href="https://www.instagram.com/minimalistbeads.co" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition mb-4"
                >
                  <Instagram size={24} className="text-pink-400" />
                  <div>
                    <p className="text-xs text-pink-300 uppercase">Follow us on IG</p>
                    <p className="font-bold">@minimalistbeads.co</p>
                  </div>
                </a>
              </div>

              <div className="pt-8 border-t border-white/10">
                <p className="text-sm text-pink-200/60 mb-4">Have an urgent query?</p>
                <a 
                  href="https://wa.me/917357814309"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition shadow-lg shadow-green-900/20"
                >
                  <MessageCircle size={22} />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
