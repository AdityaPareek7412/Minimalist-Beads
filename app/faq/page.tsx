// app/faq/page.tsx

import { HelpCircle, ChevronRight, MessageCircle } from "lucide-react"

export const metadata = {
  title: "FAQ - Minimalist Beads",
  description: "Frequently Asked Questions about Minimalist Beads.",
}

const faqCategories = [
  {
    title: "Shipping & Delivery",
    questions: [
      {
        q: "How do I know if my order has been shipped?",
        a: "We share all shipping updates and tracking IDs directly on our Instagram stories (@minimalistbeads.co). Stay connected to see when your order is on its way!"
      },
      {
        q: "When will my order arrive?",
        a: "Preparation usually takes up to 10 working days. After shipping, delivery typically takes 2–10 business days depending on your location and chosen courier."
      },
      {
        q: "Do you offer faster shipping?",
        a: "Yes! For faster service, we recommend choosing a private courier option at checkout (additional charges apply)."
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping is calculated at checkout based on weight. Our standard rate is ₹80 per kg."
      }
    ]
  },
  {
    title: "Orders & Returns",
    questions: [
      {
        q: "Do you accept returns or exchanges?",
        a: "Since we manage everything single-handedly, we do not accept returns or exchanges unless an item is damaged or missing."
      },
      {
        q: "What if my item is damaged or missing?",
        a: "Reach out to us immediately at 7357814309. We'll either refund the amount or add a replacement in your next order. Note: A mandatory unboxing video is required for all claims."
      },
      {
        q: "Do you offer COD?",
        a: "No, we currently only accept prepaid orders through UPI, Cards, Net Banking, and Wallets."
      }
    ]
  },
  {
    title: "Contact & Support",
    questions: [
      {
        q: "How can I contact you for urgent orders?",
        a: "For urgent orders or any queries, email us at minimalistbeadsco@gmail.com or call/WhatsApp us at 7357814309."
      }
    ]
  }
]

export default function FAQ() {
  return (
    <div className="bg-[#fdf0f5] min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg shadow-pink-100 text-pink-500 mb-6">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2d111a] mb-4">Frequently Asked Questions</h1>
          <p className="font-cursive text-pink-600 text-xl">Everything you need to know.</p>
        </div>

        <div className="space-y-12">
          {faqCategories.map((category, idx) => (
            <section key={idx}>
              <h2 className="text-2xl font-serif font-bold text-[#2d111a] mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-pink-500 rounded-full"></span>
                {category.title}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, qIdx) => (
                  <div 
                    key={qIdx}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 hover:border-pink-200 transition-all group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-serif font-bold text-[#2d111a] mb-2 group-hover:text-pink-600 transition-colors">
                          {item.q}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                      <ChevronRight className="text-pink-200 group-hover:text-pink-500 transition-colors mt-1" size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 p-8 md:p-12 bg-white rounded-[2rem] shadow-xl shadow-pink-100 border border-pink-50 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-serif font-bold text-[#2d111a] mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-0">
              Can't find what you're looking for? Reach out to our friendly team on WhatsApp or Instagram!
            </p>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://wa.me/917357814309"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-green-100"
            >
              <MessageCircle size={20} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
