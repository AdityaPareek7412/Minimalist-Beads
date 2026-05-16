// app/shipping-policy/page.tsx

import { Truck, Package, Clock, ShieldAlert, CreditCard, Search } from "lucide-react"

export const metadata = {
  title: "Shipping Policy - Minimalist Beads",
  description: "Learn about our shipping process, delivery times, and costs.",
}

const faqs = [
  {
    icon: <Search className="text-pink-500" size={24} />,
    question: "How do I know if my order has been shipped?",
    answer: "We keep it transparent and simple! We share all shipping updates and tracking details via our Instagram stories. Stay connected with us @minimalistbeads.co to see your package on its way."
  },
  {
    icon: <Clock className="text-pink-500" size={24} />,
    question: "When will my order arrive?",
    answer: "Orders are usually prepared within 10 working days during high workload periods, but may be ready earlier during lighter weeks. Once shipped, delivery usually takes 2–10 business days, depending on your location and the courier service you select."
  },
  {
    icon: <Truck className="text-pink-500" size={24} />,
    question: "How long does it take to ship an order?",
    answer: "All confirmed orders are processed and shipped within 6 business days after final preparation, depending on product availability."
  },
  {
    icon: <ShieldAlert className="text-pink-500" size={24} />,
    question: "What if my package arrives damaged?",
    answer: "Please refuse delivery if the package appears visibly damaged. Notify us immediately via WhatsApp or call at 7357814309. We will either resend your order or issue a full refund, provided the issue is reported within 7 days of delivery. Note: An unboxing video is mandatory for all damage or defect claims."
  },
  {
    icon: <CreditCard className="text-pink-500" size={24} />,
    question: "How much does shipping cost?",
    answer: "Shipping charges are calculated automatically at checkout based on order weight and delivery location. Our standard rate starts at ₹80 per kg. In case of returns (where applicable), the buyer may be required to bear the return shipping cost."
  }
]

export default function ShippingPolicy() {
  return (
    <div className="bg-[#fdf0f5] min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2d111a] mb-4">Shipping Policy</h1>
          <p className="font-cursive text-pink-600 text-xl">From our hands to your doorstep.</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-6 md:p-8 shadow-md shadow-pink-100 border border-pink-50 hover:border-pink-200 transition group"
            >
              <div className="flex gap-4 md:gap-6">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    {faq.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#2d111a] mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#2d111a] rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl font-serif font-bold mb-6">Need more help?</h2>
          <p className="text-pink-200 mb-8 max-w-lg mx-auto text-lg">
            For any shipping-related queries or urgent orders, feel free to contact us. We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="tel:+917357814309" 
              className="px-8 py-3 bg-pink-500 rounded-full font-bold hover:bg-pink-400 transition shadow-lg shadow-pink-900/20"
            >
              Call 7357814309
            </a>
            <a 
              href="mailto:minimalistbeadsco@gmail.com" 
              className="px-8 py-3 bg-white/10 rounded-full font-bold hover:bg-white/20 transition border border-white/20"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
