// app/layout.tsx

import type { Metadata } from "next"
import { Inter, Cormorant_Garamond, Dancing_Script } from "next/font/google"
import "@/styles/globals.css"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { LayoutWrapper } from "@/components/common/LayoutWrapper"
import { CartProvider } from "@/context/cartContext"
import { WishlistProvider } from "@/context/wishlistContext"
import { Analytics } from "@vercel/analytics/react"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db/prisma"

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

// Cache site settings for 5 minutes server-side.
// Tagged with "settings" — busts automatically when admin saves new settings.
// This replaces the client-side useEffect in Header/WhyChooseUs/Cart/Checkout
// that was hitting the DB on every single page load.
const getCachedLayoutSettings = unstable_cache(
  async () => {
    try {
      const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } })
      return {
        shippingFee: settings?.shippingFee ?? 80,
        freeShippingLimit: settings?.freeShippingLimit ?? 0,
        announcement: settings?.announcement ?? null,
      }
    } catch {
      return { shippingFee: 80, freeShippingLimit: 0, announcement: null }
    }
  },
  ["layout-site-settings"],
  { revalidate: 300, tags: ["settings"] }
)

export type SiteSettings = {
  shippingFee: number
  freeShippingLimit: number
  announcement: string | null
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch once per ISR cycle — shared across all pages, no per-user DB hit
  const settings = await getCachedLayoutSettings()

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${dancing.variable}`}>
      <body className="font-sans antialiased bg-[#fdf0f5] text-gray-900 min-h-screen">
        <WishlistProvider>
          <CartProvider>
            <LayoutWrapper>
              {/* Settings passed as prop — no client-side DB call */}
              <Header initialSettings={settings} />
            </LayoutWrapper>
            <main className="min-h-screen w-full max-w-full overflow-x-clip">{children}</main>
            <LayoutWrapper>
              <Footer />
            </LayoutWrapper>
            <Analytics />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  )
}

