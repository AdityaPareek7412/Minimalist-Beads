// app/terms/page.tsx

import { FileText, CreditCard, Mail } from "lucide-react"

export const metadata = {
  title: "Terms and Services - Minimalist Beads",
  description: "Terms and conditions for using Minimalist Beads website and services.",
}

const terms = [
  {
    title: "Acceptance of Terms",
    content: "By using the website, purchasing our products, participating in reviews or promotions, or sharing your personal information with us, you confirm that you have read and understood these Terms and agree to comply with all applicable laws and regulations. If you do not agree, you must stop using our website immediately."
  },
  {
    title: "Online Store Terms",
    content: "You must be at least the age of majority in your state/province, or have parental/guardian consent. You agree not to use our products for unlawful purposes or violate local/international laws. You must not transmit viruses, malware, or harmful code. Any violation may result in termination of your access to the Service."
  },
  {
    title: "Intellectual Property & Ownership",
    content: "All content on this website, including text, graphics, images, and design, is protected by copyright and intellectual property laws. You may not copy, modify, reproduce, distribute, or exploit content without prior written consent from Minimalist Beads."
  },
  {
    title: "General Conditions",
    content: "We reserve the right to refuse service to anyone at any time. Non-credit card data may be transmitted unencrypted across networks. Credit card information is always encrypted. You may not duplicate, resell, or exploit our Service without written permission."
  },
  {
    title: "Accuracy of Information",
    content: "We strive for accuracy, but we cannot guarantee that information on the site is always complete, reliable, or up-to-date. The content is for general information only and should not be the sole basis for decisions."
  },
  {
    title: "Modifications to Service & Prices",
    content: "Product prices are subject to change without notice. We may modify, suspend, or discontinue the Service at any time without liability."
  },
  {
    title: "Products & Services",
    content: "Certain products may be available exclusively online. Product colors and images may vary depending on your display. We reserve the right to limit sales by region or customer. All descriptions and prices are subject to change without notice. We do not guarantee that products will meet your expectations."
  },
  {
    title: "Billing & Account Information",
    content: "We reserve the right to refuse or cancel orders at our discretion. You must provide accurate and current billing and contact information. Orders may be canceled if they appear to be placed by resellers or distributors."
  },
  {
    title: "Third-Party Tools & Links",
    content: "We may provide access to third-party tools “as is” and “as available.” Third-party links may lead to websites not affiliated with us. We are not responsible for their content, policies, or services."
  },
  {
    title: "Health & Medical Disclaimer",
    content: "Any product-related claims on our site have not been evaluated by FSSAI or other authorities. Products are not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before using any product."
  },
  {
    title: "User Submissions",
    content: "Any suggestions, feedback, or materials submitted may be used by us without restriction. You may not submit unlawful, abusive, or harmful content. You are solely responsible for the accuracy of your submissions."
  },
  {
    title: "Prohibited Uses",
    content: "You may not use the site for illegal activities, violating intellectual property, harassment, uploading malicious software, collecting personal information unlawfully, or spam/phishing activity. Violation may result in termination of your access."
  },
  {
    title: "Errors & Omissions",
    content: "Occasionally, product descriptions, pricing, promotions, or availability may contain errors. We reserve the right to correct, update, or cancel orders at any time without notice."
  },
  {
    title: "Indemnification",
    content: "You agree to indemnify and hold Minimalist Beads, its affiliates, employees, and partners harmless from any claims, damages, or expenses arising out of your violation of these Terms or any applicable laws."
  },
  {
    title: "Severability",
    content: "If any part of these Terms is found unenforceable, the rest will remain valid and enforceable."
  },
  {
    title: "Termination",
    content: "We may terminate or suspend your access to the Service at any time if you fail to comply with these Terms."
  },
  {
    title: "Governing Law",
    content: "These Terms shall be governed by the laws of India."
  },
  {
    title: "Changes to Terms",
    content: "We may update these Terms at any time. Continued use of the website after changes indicates acceptance."
  }
]

export default function TermsAndServices() {
  return (
    <div className="bg-[#fdf0f5] min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-pink-100 overflow-hidden border border-pink-50">
          <div className="bg-[#2d111a] p-8 md:p-12 text-white text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Terms & Services</h1>
            <p className="text-pink-200/80">Please read these terms carefully before using our services.</p>
          </div>

          <div className="p-8 md:p-12">
            <div className="space-y-12">
              {terms.map((term, index) => (
                <section key={index} className="relative pl-12 group">
                  <span className="absolute left-0 top-0 text-3xl font-serif font-bold text-pink-100 group-hover:text-pink-200 transition-colors">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <h2 className="text-xl font-serif font-bold text-[#2d111a] mb-3">{term.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{term.content}</p>
                </section>
              ))}

              {/* Payment Methods */}
              <section className="pt-12 border-t border-pink-100">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="text-pink-500" size={24} />
                  <h2 className="text-2xl font-serif font-bold text-[#2d111a]">Payment Methods</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Credit / Debit Cards", "UPI Payments", "Net Banking", "Wallets"].map((method) => (
                    <div key={method} className="p-4 bg-pink-50 rounded-xl text-center text-sm font-medium text-pink-700">
                      {method}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500 italic font-medium">Note: We do not offer Cash on Delivery (COD).</p>
              </section>

              {/* Contact Information */}
              <section className="pt-12 border-t border-pink-100">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="text-pink-500" size={24} />
                  <h2 className="text-2xl font-serif font-bold text-[#2d111a]">Contact Information</h2>
                </div>
                <p className="text-gray-600 mb-6">If you have any questions about these Terms, please contact us:</p>
                <div className="bg-pink-50 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm">
                       <Mail size={18} />
                     </div>
                     <a href="mailto:minimalistbeadsco@gmail.com" className="text-lg font-bold text-[#2d111a] hover:text-pink-600 transition">
                       minimalistbeadsco@gmail.com
                     </a>
                   </div>
                   <div className="text-sm text-gray-500">
                     Available for queries and support
                   </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center text-gray-400 text-xs uppercase tracking-widest">
          © 2024 Minimalist Beads • All Rights Reserved
        </div>
      </div>
    </div>
  )
}
