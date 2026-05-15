// app/layout.tsx

import type { Metadata } from "next"
import { Inter, Cormorant_Garamond, Dancing_Script } from "next/font/google"
import "@/styles/globals.css"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { CartProvider } from "@/context/cartContext"

import { WishlistProvider } from "@/context/wishlistContext"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
})
const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cursive",
})

export const metadata: Metadata = {
  title: "MinimalistBeads - Aesthetic Jewelry & Charms",
  description:
    "Handcrafted minimalist jewelry and aesthetic accessories for the modern soul. Premium quality, Gen-Z approved.",
  keywords:
    "jewelry, charms, aesthetic, minimalist, handmade, resin art, pendants, beads, rings, accessories",
  openGraph: {
    title: "MinimalistBeads - Aesthetic Jewelry & Charms",
    description:
      "Handcrafted minimalist jewelry and aesthetic accessories for the modern soul.",
    type: "website",
    siteName: "MinimalistBeads",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${dancing.variable}`}>
      <body className="font-sans antialiased bg-[#fdf0f5] text-gray-900 min-h-screen">
        <WishlistProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  )
}
