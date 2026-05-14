// app/layout.tsx

import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "@/styles/globals.css"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { CartProvider } from "@/context/cartContext"

import { WishlistProvider } from "@/context/wishlistContext"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-black text-white min-h-screen">
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
