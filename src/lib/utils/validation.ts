// src/lib/utils/validation.ts

import { z } from 'zod'

// Product validation
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  categoryId: z.string().min(1, 'Category is required'),
})

// Address validation
export const addressSchema = z.object({
  firstName: z.string().min(2, 'First name too short'),
  lastName: z.string().min(2, 'Last name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  street: z.string().min(5, 'Street too short'),
  city: z.string().min(2, 'City too short'),
  state: z.string().min(2, 'State too short'),
  postalCode: z.string()
    .regex(/^[0-9]{6}$/, 'Postal code must be 6 digits'),
  country: z.string().default('India'),
})

// Review validation
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating required').max(5, 'Max rating is 5'),
  title: z.string().min(3, 'Title too short').max(100, 'Title too long').optional(),
  comment: z.string().min(10, 'Comment too short').max(1000, 'Comment too long').optional(),
})

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
})

// Signup validation
export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[a-z]/, 'Password must contain lowercase')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Coupon validation
export const couponSchema = z.object({
  code: z.string().min(3, 'Invalid coupon code'),
})

// Cart item validation
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity too high'),
})

// Validation functions
export function validateEmail(email: string): boolean {
  const schema = z.string().email()
  return schema.safeParse(email).success
}

export function validatePhone(phone: string): boolean {
  const schema = z.string().regex(/^[0-9]{10}$/)
  return schema.safeParse(phone).success
}

export function validatePostalCode(code: string): boolean {
  const schema = z.string().regex(/^[0-9]{6}$/)
  return schema.safeParse(code).success
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('One number')

  return {
    isValid: errors.length === 0,
    errors,
  }
}
