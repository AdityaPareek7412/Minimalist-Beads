// app/products/[slug]/page.tsx

"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Share2, ShoppingBag, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "@/context/cartContext"
import { ProductCard } from "@/components/product/ProductCard"
import { formatPrice } from "@/lib/utils/helpers"

// Mock product data
const mockProduct = {
  id: "1",
  name: "Amethyst Cluster Ring",
  slug: "amethyst-cluster-ring",
  description: "Beautiful handcrafted amethyst cluster ring perfect for aesthetic lovers.",
  price: 2499,
  originalPrice: 3499,
  stock: 10,
  sold: 45,
  featured: true,
  trending: true,
  newArrival: false,
  categoryId: "1",
  images: [
    {
      id: "1",
      productId: "1",
      url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop",
      alt: "Amethyst Ring Front",
      order: 0,
    },
    {
      id: "2",
      productId: "1",
      url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop",
      alt: "Amethyst Ring Side",
      order: 1,
    },
    {
      id: "3",
      productId: "1",
      url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop",
      alt: "Amethyst Ring Detail",
      order: 2,
    },
    {
      id: "4",
      productId: "1",
      url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop",
      alt: "Amethyst Ring Worn",
      order: 3,
    },
  ],
  sku: "AME-RING-001",
  material: "Natural Amethyst, 925 Silver",
  size: "Adjustable (6-10)",
  color: "Purple",
  weight: "8g",
  dimensions: "2cm x 2.5cm",
  seoTitle: "Amethyst Cluster Ring | Minimalist Beads",
  seoDescription: "Beautiful handcrafted amethyst cluster ring for aesthetic lovers.",
  seoKeywords: "amethyst ring, cluster ring, healing crystal jewelry",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-15"),
  category: {
    id: "1",
    name: "Rings",
    slug: "rings",
    description: null,
    image: null,
    icon: null,
    featured: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

const relatedProducts = [
  {
    id: "2",
    name: "Pearl Drop Pendant",
    slug: "pearl-drop-pendant",
    description: "Elegant pearl drop pendant",
    price: 1799,
    stock: 15,
    featured: true,
    trending: false,
    newArrival: true,
    categoryId: "2",
    images: [
      {
        id: "3",
        productId: "2",
        url: "https://images.unsplash.com/photo-1599643478094-f8fb1dd4d86c?w=500&h=500&fit=crop",
        alt: "Pearl",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // More products...
]

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(mockProduct, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                <Image
                  src={mockProduct.images[selectedImage].url}
                  alt={mockProduct.images[selectedImage].alt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                    index === selectedImage
                      ? "border-pink-400"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">
              Home / Shop / {mockProduct.category?.name} / {mockProduct.name}
            </div>

            {/* Title & Badges */}
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                {mockProduct.newArrival && (
                  <span className="bg-pink-100 text-pink-600 px-3 py-1 text-xs font-semibold rounded-full">
                    NEW
                  </span>
                )}
                {mockProduct.trending && (
                  <span className="bg-purple-100 text-purple-600 px-3 py-1 text-xs font-semibold rounded-full">
                    TRENDING
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                {mockProduct.name}
              </h1>
              <p className="text-gray-600">{mockProduct.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">(124 reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(mockProduct.price)}
                </span>
                {mockProduct.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(mockProduct.originalPrice)}
                    </span>
                    <span className="text-lg font-semibold text-orange-400">
                      -
                      {Math.round(
                        ((mockProduct.originalPrice - mockProduct.price) /
                          mockProduct.originalPrice) *
                          100
                      )}
                      %
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6 flex items-center gap-2">
              {mockProduct.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">In Stock</span>
                  {mockProduct.stock < 10 && (
                    <span className="text-xs text-orange-600">Only {mockProduct.stock} left!</span>
                  )}
                </>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Material
                </p>
                <p className="font-medium text-gray-900">{mockProduct.material}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Size</p>
                <p className="font-medium text-gray-900">{mockProduct.size}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Weight</p>
                <p className="font-medium text-gray-900">{mockProduct.weight}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Color</p>
                <p className="font-medium text-gray-900">{mockProduct.color}</p>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  −
                </button>
                <span className="px-6 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={mockProduct.stock === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  isAdded
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:shadow-lg"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ShoppingBag size={20} />
                {isAdded ? "Added!" : "Add to Cart"}
              </motion.button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-2">
              <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Heart size={20} />
                Add to Wishlist
              </button>
              <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share
              </button>
            </div>

            {/* Delivery Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Free Shipping</span> on orders above ₹500
              </p>
              <p className="text-sm text-blue-900 mt-2">
                Estimated Delivery: <span className="font-semibold">3-5 business days</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="border-t border-b border-gray-200 mb-16">
          <div className="grid grid-cols-3 gap-0">
            {["Description", "Reviews", "Shipping"].map((tab) => (
              <button
                key={tab}
                className="py-4 px-6 text-center font-medium border-b-2 border-transparent hover:border-pink-400 transition"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold mb-8">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
