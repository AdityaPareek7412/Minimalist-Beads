# 💎 Minimalist Beads: Complete Operational Guide (A to Z)

Welcome to your custom-built e-commerce storefront. This document serves as a comprehensive manual for managing your business operations, from handling orders to updating site-wide settings.

---

## 1. Customer Experience (Front-end)

### 🛍️ Browsing & Shopping
- **Gen-Z Aesthetics:** The site uses a modern "Glassmorphism" design with vibrant gradients tailored for a premium look.
- **Dynamic Categories:** Products are organized into categories like Resin Art, Aesthetic Rings, and Handmade Charms.
- **Smart Search & Filters:** Customers can search for products and filter them by category or price.

### ❤️ Wishlist & Cart
- **Persistent Wishlist:** Customers can save items to their wishlist without logging in.
- **Smart Cart Summary:**
  - Automatic subtotal calculation.
  - **Free Shipping Progress:** A live progress bar that tells customers: *"Add ₹X more for FREE shipping!"*. This encourages higher order values.

### 💳 Guest Checkout (No Account Needed)
- **Fast Conversion:** Customers don't need to create an account. They simply provide:
  - Shipping Address.
  - Contact Details (Phone/Email).
- **Payment Options:**
  - **Online Payment:** Integrated with Razorpay (UPI, Cards, NetBanking).
  - **Cash on Delivery (COD):** For customers who prefer paying at their doorstep.

### 📍 Order Tracking
- Customers can visit `/track-order` anytime.
- By entering their **Order Number** (e.g., #clp6...) and **Email**, they can see:
  - Real-time status (Pending, Shipped, etc.).
  - A visual progress stepper.
  - Courier Tracking ID and a direct link to the map (once shipped).

---

## 2. Admin Dashboard Guide (`/admin`)

Access the dashboard by logging in with your secure credentials at `/admin/login`.

### 📦 Order Management (`/admin/orders`)
- **Real-time View:** All new orders appear here instantly with product images and customer details.
- **IST Timezone:** All order timestamps are accurately converted to **Asia/Kolkata** time.
- **Updating Status:** Use the dropdown on each order card to move it through the fulfillment cycle:
  - `PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`.
- **Handling Shipments:** When you select `SHIPPED`, a form will appear to enter the **AWB/Tracking ID** and **Tracking Link**.
- **Management:** You can delete test or cancelled orders using the trash icon.

### 💎 Product Management (`/admin/products`)
- **Adding Products:** 
  - Upload images directly (automatically optimized via Cloudinary).
  - Set Prices and Categories.
  - **Featured Toggle:** Mark premium items as "Featured" to pin them to the top of the homepage.
- **Inventory Sync:** Stock levels automatically decrease when a purchase is made.

### 🎫 Coupon Management (`/admin/coupons`)
- Create promotional codes like `DIWALI20`.
- Choose between **Percentage Off** or **Fixed Amount Off**.
- Set minimum order values and expiry dates.

### ⚙️ Site Settings (`/admin/settings`)
- **Shipping Configuration:** Update your default shipping fee and the threshold for free shipping.
- **Announcement Bar:** Write a custom message (e.g., "✨ FESTIVAL SALE: 20% OFF!") that appears at the top of every page on the site.

---

## 3. Technical Architecture

- **Framework:** Next.js 14 (App Router).
- **Database:** Supabase (PostgreSQL) with Prisma ORM.
- **Authentication:** JWT-based secure admin login.
- **Payments:** Razorpay.
- **Images:** Cloudinary.
- **Timezone:** Standardized to Indian Standard Time (IST).

---

## 4. Frequently Asked Questions (FAQ)

**Q: Do customers need to log in to pay?**
**A:** No. We use a **Guest Checkout** flow to maximize conversion rates.

**Q: Is the stock updated automatically?**
**A:** Yes. The system decrements stock and increments sales counts every time a successful order is placed.

**Q: How do I change the festival message on top?**
**A:** Go to **Admin -> Settings** and update the "Announcement Bar" text. It updates instantly across the site.

---

## 5. Business & Growth Strategy 🚀

### 💰 Platform Costs (Kab kise paise dene hain?)
1. **Vercel (Hosting):** Abhi aap **Free Tier** par hain. Jab traffic mahine mein 10-20 lakh users se upar jayega, tab wo $20/month maang sakte hain.
2. **Supabase (Database):** Abhi **Free** hai. Agar aapke store par 10,000+ products ho jayenge, tab $25/month charge lag sakta hai.
3. **Cloudinary (Images):** **Free** tier 1000-2000 images ke liye kaafi hai. Usse upar jane par $15/month ho sakta hai.
4. **Razorpay (Payments):** Ye koi monthly fee nahi lete, par har transaction par approx **2% + GST** commission lete hain. (e.g., ₹100 ke order par ₹2.36 unka charge hoga).

### 🔍 SEO Tips (Google par upar kaise aayein?)
- **Keywords:** Product ke description mein "Handmade Jewelry", "Aesthetic Rings", "Resin Art India" jaise words zaroori use karein.
- **Alt Text:** Naya product add karte waqt "Alt Text" mein product ka naam likhein.
- **Google Search Console:** Apni website ko Google Search Console par register karein (Free hai).
- **Backlinks:** Apne Instagram aur Facebook profile par website ka link zaroori dalein.

### 📸 Instagram Marketing & Ads
- **Reels is King:** Aesthetic products (Beads/Rings) ki reels sabse zyada chalti hain.
- **Insta Ads:** Facebook Ads Manager use karein. "Carousel Ads" chalayein jisme 5-6 mst products slide ho rahe hon.
- **Targeting:** Gen-Z (18-24 years old) ko target karein jinka interest "Handmade", "Aesthetic Fashion", aur "Online Shopping" mein ho.

### 📈 Scalability (Traffic kitna handle hoga?)
- Hamari website **Next.js** aur **Serverless** technology par bani hai.
- Ye ek saath **hazaaron (thousands)** customers ko sambhal sakti hai bina crash huye. Vercel ise apne aap scale karta hai, toh aapko tension lene ki zaroorat nahi hai.

### 🌟 Future Growth Ideas
- **WhatsApp Integration:** Customers ko direct WhatsApp par update bhejna.
- **Review System:** Customers ki real photos website par dikhana (Trust badhta hai).
- **Email Marketing:** Har mahine naye collections ka email bhejna.

---

*Document Updated on 15 May 2026.*
