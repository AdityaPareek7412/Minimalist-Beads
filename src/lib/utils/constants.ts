// src/lib/utils/constants.ts

export const SITE_CONFIG = {
  name: 'MinimalistBeads',
  description: 'Handcrafted minimalist jewelry and aesthetic accessories',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/images/og-image.jpg',
  twitterHandle: '@minimalistbeads',
  email: 'hello@minimalistbeads.com',
  phone: '+91 12345 67890',
  address: 'New Delhi, India',
}

export const PRICE_CONFIG = {
  currency: '₹',
  currencyCode: 'INR',
  freeShippingThreshold: 500,
  standardShippingCost: 50,
  taxRate: 0.18, // 18% GST
}

export const PAGINATION = {
  productsPerPage: 12,
  ordersPerPage: 10,
  reviewsPerPage: 5,
}

export const PRODUCT_CATEGORIES = [
  { id: 'gothic', name: 'Gothic Charms', icon: '🖤' },
  { id: 'cute', name: 'Cute Charms', icon: '🌸' },
  { id: 'resin', name: 'Resin Art', icon: '✨' },
  { id: 'rings', name: 'Rings', icon: '💎' },
  { id: 'pendants', name: 'Pendants', icon: '⭐' },
  { id: 'beads', name: 'Beads', icon: '🌈' },
  { id: 'handmade', name: 'Handmade', icon: '🎨' },
  { id: 'limited', name: 'Limited Drops', icon: '🎁' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'trending', label: 'Trending' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
]

export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
}

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

export const PAYMENT_METHODS = [
  { value: 'razorpay', label: 'Razorpay (Card, UPI, NetBanking)' },
  { value: 'upi', label: 'UPI (Google Pay, PhonePe, etc.)' },
  { value: 'cod', label: 'Cash on Delivery' },
]

export const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export const TOAST_MESSAGES = {
  ADDED_TO_CART: '✨ Added to cart!',
  REMOVED_FROM_CART: '🗑️ Removed from cart',
  ORDER_CREATED: '✅ Order created successfully!',
  PAYMENT_FAILED: '❌ Payment failed. Please try again.',
  COUPON_APPLIED: '💰 Coupon applied!',
  WISHLIST_ADDED: '❤️ Added to wishlist',
  WISHLIST_REMOVED: '🚫 Removed from wishlist',
  PROFILE_UPDATED: '👤 Profile updated',
  ERROR: 'Something went wrong',
  LOADING: '⏳ Loading...',
}

export const SEO_DEFAULTS = {
  title: 'MinimalistBeads - Aesthetic Jewelry & Charms',
  description:
    'Handcrafted minimalist jewelry and aesthetic accessories for the modern soul. Premium quality, Gen-Z approved.',
  keywords:
    'jewelry, charms, aesthetic, minimalist, handmade, resin art, pendants, beads, rings, accessories',
}

export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
}
