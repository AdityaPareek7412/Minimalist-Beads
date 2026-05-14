// src/components/common/Footer.tsx

import Link from "next/link"
import { Mail, Phone, MapPin, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black/60 backdrop-blur-xl border-t border-white/10 text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4">MinimalistBeads</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Minimalist jewelry and aesthetic accessories for the modern soul.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">SHOP</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">SUPPORT</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">NEWSLETTER</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for new drops and exclusive offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-gray-800 text-white text-sm rounded-l focus:outline-none"
              />
              <button className="px-4 py-2 bg-pink-400 text-white text-sm font-medium rounded-r hover:bg-pink-500 transition">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:minimalistbeadsco@gmail.com" className="hover:text-fuchsia-400 transition">
                  minimalistbeadsco@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+917357814309" className="hover:text-fuchsia-400 transition">
                  +91 73578 14309
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Jaipur, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-end gap-4">
              <a
                href="https://www.instagram.com/minimalistbeads.co?igsh=d3psMDlqeXQxbjdn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-fuchsia-500 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-400 transition"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Minimalist Beads (minimalistbeads.in). All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
