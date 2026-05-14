// src/types/index.ts

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null; // Allow null
  price: number;
  originalPrice: number | null; // Allow null
  stock: number;
  sold: number;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  categoryId: string;
  images: Array<{
    id: string;
    productId: string;
    url: string;
    alt: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null; // Allow null
  image: string;
  icon: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  clerkId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  shippingAddress?: Address;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  couponId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payment?: Payment;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  type: string;
  name?: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  product?: Product;
  userId: string;
  user?: User;
  rating: number;
  title?: string;
  comment?: string;
  helpful: number;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  active: boolean;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  RAZORPAY = "RAZORPAY",
  STRIPE = "STRIPE",
  UPI = "UPI",
  WALLET = "WALLET",
  COD = "COD",
}

export interface FilterOptions {
  categories?: string[];
  priceRange?: [number, number];
  sortBy?: "newest" | "trending" | "price-low" | "price-high" | "popular";
  search?: string;
}
