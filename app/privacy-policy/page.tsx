// app/privacy-policy/page.tsx

import { Shield, Eye, Lock, Cookie, Share2, Scale, RefreshCw, Mail, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Privacy Policy - Minimalist Beads",
  description: "Learn how Minimalist Beads collects, uses, protects, and manages your personal information.",
}

const policySections = [
  {
    icon: <Eye className="text-pink-500" size={24} />,
    title: "Information We Collect",
    content: "We collect information you provide directly to us when you make a purchase, create an account, or contact us. This includes your name, shipping address, billing address, email address, phone number, and any special delivery instructions. We also automatically gather device information, including your IP address, browser type, and interaction data when you browse our storefront."
  },
  {
    icon: <Lock className="text-pink-500" size={24} />,
    title: "How We Use Your Information",
    content: "Your data helps us serve you better. We use it to process and fulfill your orders, send order confirmations and shipping tracking numbers, respond to customer service inquiries, prevent fraud, and, with your consent, share updates about our new collections and exclusive promotions."
  },
  {
    icon: <Shield className="text-pink-500" size={24} />,
    title: "Data Security & Protection",
    content: "We prioritize your security. While no electronic transmission is 100% secure, we implement industry-standard administrative, technical, and physical safeguards to protect your personal details. All payment transactions are processed through secure, PCI-DSS compliant payment gateways (like Razorpay) and are encrypted using Secure Sockets Layer (SSL) technology."
  },
  {
    icon: <Cookie className="text-pink-500" size={24} />,
    title: "Cookies & Tracking",
    content: "We use cookies to enhance your browsing experience, remember cart contents between visits, understand storefront traffic patterns, and provide personalized recommendations. You can manage cookie preferences in your browser settings, though disabling them may limit some interactive features of our online store."
  },
  {
    icon: <Share2 className="text-pink-500" size={24} />,
    title: "Sharing with Third Parties",
    content: "We never sell or rent your personal information to third parties. We only share necessary data with trusted service providers who help us run our shop — such as courier partners (for delivering your orders), SMS/Email notification services (to keep you updated), and payment processors."
  },
  {
    icon: <Scale className="text-pink-500" size={24} />,
    title: "Your Rights & Choices",
    content: "You have the right to access, update, correct, or request the deletion of the personal information we hold about you. If you would like to edit your details or opt-out of marketing communications, you can do so by contacting us directly via our support channels."
  },
  {
    icon: <RefreshCw className="text-pink-500" size={24} />,
    title: "Policy Updates",
    content: "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. Any updates will be posted directly on this page with an updated revision date."
  },
  {
    icon: <CheckCircle className="text-pink-500" size={24} />,
    title: "Governing Law",
    content: "This Privacy Policy and all matters relating to your data privacy are governed by and construed in accordance with the laws of India, under the jurisdiction of the courts in Jaipur, Rajasthan."
  }
]

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#fdf0f5] min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/60 text-pink-700 text-sm font-semibold tracking-wider uppercase mb-4">
            <Shield size={14} /> Trust & Transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2d111a] mb-4">Privacy Policy</h1>
          <p className="font-cursive text-pink-600 text-xl">We respect and protect your privacy.</p>
        </div>

        <div className="space-y-6">
          {policySections.map((section, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-6 md:p-8 shadow-md shadow-pink-100 border border-pink-50 hover:border-pink-200 transition-all duration-300 group hover:-translate-y-0.5"
            >
              <div className="flex gap-4 md:gap-6">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                    {section.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#2d111a] mb-3 flex items-center gap-2">
                    <span className="text-pink-300/80 font-mono text-sm font-normal">{(index + 1).toString().padStart(2, '0')}.</span>
                    {section.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base font-normal">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support Segment */}
        <div className="mt-16 bg-[#2d111a] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-pink-900/10">
          <div className="relative z-10 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-4">Questions About Your Privacy?</h2>
            <p className="text-pink-200/80 mb-8 text-sm md:text-base leading-relaxed">
              If you have any questions about how we manage your personal information or wish to make a data request, feel free to contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:minimalistbeadsco@gmail.com" 
                className="px-8 py-3.5 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-400 transition-all shadow-lg shadow-pink-900/30 text-sm md:text-base"
              >
                minimalistbeadsco@gmail.com
              </a>
            </div>
          </div>
          {/* Aesthetic background glow */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />
        </div>
        
        <div className="mt-12 text-center text-gray-400 text-xs uppercase tracking-widest">
          Last Updated: May 2026 • Minimalist Beads
        </div>
      </div>
    </div>
  )
}
