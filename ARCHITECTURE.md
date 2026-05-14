# MinimalistBeads - Complete Architecture Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                           │
│  (Browser) → Next.js Frontend (React + TypeScript)          │
└────────────────────┬────────────────────────────────────────┘
                     │
              ┌──────▼──────┐
              │  Next.js    │
              │  App Router │
              │   & API     │
              └──────┬──────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼────┐ ┌───▼──┐  ┌───▼───┐
    │ Pages   │ │ API  │  │Middleware
    │(SSR/CSR)│ │Routes│  │(Auth)
    └─────────┘ └──────┘  └───────┘
         │           │           │
         └───────────┼───────────┘
                     │
    ┌────────────────▼────────────────┐
    │  External Services              │
    │  - Razorpay (Payments)          │
    │  - Cloudinary (Images)          │
    │  - Clerk (Auth)                 │
    └────────────────┬────────────────┘
                     │
              ┌──────▼───────┐
              │ PostgreSQL   │
              │  Database    │
              └──────────────┘
```

## Component Architecture

### Layer 1: Presentation Layer
```
Pages (Next.js App Router)
    ├─ /                    (Home - Hero + Sections)
    ├─ /shop                (Product Grid)
    ├─ /products/[slug]     (Product Detail)
    ├─ /cart                (Shopping Cart)
    ├─ /checkout            (Multi-step Checkout)
    ├─ /account             (User Profile)
    ├─ /wishlist            (Wishlist)
    └─ /orders              (Order History)
```

### Layer 2: Component Layer
```
Components
├─ common/
│  ├─ Header.tsx          (Navigation)
│  ├─ Footer.tsx          (Footer)
│  └─ Layout.tsx          (Root Layout)
├─ product/
│  ├─ ProductCard.tsx     (Grid Item)
│  ├─ ProductGallery.tsx  (Image Carousel)
│  └─ Reviews.tsx         (Review Section)
└─ sections/
   ├─ HeroSection.tsx     (Landing Hero)
   ├─ FeaturedProducts.tsx (Featured Collection)
   ├─ CategoriesSection.tsx (Category Showcase)
   ├─ WhyChooseUs.tsx     (USP Section)
   └─ NewsletterSection.tsx (Newsletter)
```

### Layer 3: State Management
```
Context API (React Context)
├─ CartContext           (Cart State)
├─ UserContext           (User Auth)
└─ NotificationContext   (Toast/Alerts)

Custom Hooks
├─ useProducts()         (Fetch Products)
├─ useCart()             (Cart Operations)
├─ useUser()             (User Data)
└─ useOrders()           (Order Management)
```

### Layer 4: API Layer
```
API Routes (/pages/api)
├─ /products/index.ts    (GET, POST)
├─ /products/[slug].ts   (GET, PUT, DELETE)
├─ /orders/index.ts      (GET, POST)
├─ /payment/verify.ts    (POST)
├─ /cart.ts              (GET, POST, DELETE)
├─ /categories.ts        (GET, POST)
├─ /reviews.ts           (GET, POST)
└─ /wishlist.ts          (GET, POST, DELETE)
```

### Layer 5: Data Layer
```
Prisma ORM
├─ /prisma/schema.prisma (DB Schema)
└─ /src/lib/db/prisma.ts (Prisma Client)

PostgreSQL Database
├─ Users Table
├─ Products Table
├─ Orders Table
├─ OrderItems Table
├─ Payments Table
├─ Categories Table
├─ Reviews Table
├─ Wishlist Table
├─ CartItems Table
├─ Addresses Table
└─ Coupons Table
```

## Data Flow Diagrams

### User Registration & Authentication
```
User Visits Site
    ↓
Clerk Authentication Widget
    ↓
Create User in Database
    ↓
Store JWT in Local Storage
    ↓
Set User Context
    ↓
Redirect to Dashboard
```

### Shopping Flow
```
Browse Products
    ↓
Click "Add to Cart"
    ↓
Cart Context Updated
    ↓
Save to LocalStorage
    ↓
Update Cart Icon Badge
    ↓
Proceed to Checkout
    ↓
Fill Address Form
    ↓
Select Payment Method
    ↓
Create Order (API)
    ↓
Initiate Razorpay Payment
    ↓
Verify Payment Signature
    ↓
Update Order Status
    ↓
Confirmation Page
```

### Payment Processing
```
Checkout Form Submitted
    ↓
Create Order (DB)
    ↓
Initialize Razorpay Order with Amount
    ↓
Display Razorpay Modal
    ↓
User Completes Payment
    ↓
Razorpay Returns Response
    ↓
Verify Signature (Server)
    ↓
Update Payment Status
    ↓
Update Order Status → CONFIRMED
    ↓
Send Confirmation Email
    ↓
Redirect to Success Page
```

## API Flow Examples

### Get Products with Filters
```
Request:
GET /api/products?page=1&limit=12&categories=rings,charms&sortBy=trending&minPrice=100&maxPrice=5000

Processing:
1. Parse query parameters
2. Build Prisma filter object
3. Query database with filters
4. Paginate results
5. Include relations (images, category)

Response:
{
  "products": [...],
  "total": 245,
  "page": 1,
  "limit": 12,
  "totalPages": 21
}
```

### Create Order
```
Request:
POST /api/orders
{
  "userId": "user_123",
  "items": [
    { "productId": "prod_1", "quantity": 2 },
    { "productId": "prod_2", "quantity": 1 }
  ],
  "shippingAddressId": "addr_123",
  "paymentMethod": "razorpay",
  "couponCode": "SAVE10"
}

Processing:
1. Validate user
2. Check product stock
3. Calculate totals (subtotal, tax, shipping)
4. Apply coupon discount
5. Create order in database
6. Create associated payment record
7. Initialize Razorpay order if needed
8. Return order + payment details

Response:
{
  "order": {
    "id": "ord_123",
    "orderNumber": "MB20240115001",
    "total": 2999,
    "status": "PENDING"
  },
  "razorpayOrder": {
    "id": "order_1234567890",
    "amount": 299900
  }
}
```

## Database Relationships

```
User (1) → (Many) Orders
        → (Many) CartItems
        → (Many) Reviews
        → (Many) Addresses
        → (Many) WishlistItems

Category (1) → (Many) Products

Product (1) → (Many) OrderItems
          → (Many) Reviews
          → (Many) CartItems
          → (Many) WishlistItems
          → (Many) ProductImages

Order (1) → (Many) OrderItems
        → (1) Payment
        → (1) Address
        → (0-1) Coupon

Payment (1) → (1) Order

Coupon (1) → (Many) Orders
```

## Security Architecture

### Authentication
```
1. Clerk handles user authentication
2. JWT tokens stored in browser
3. API routes verify token
4. Protected routes check authentication
```

### Authorization
```
1. User can only view their own orders
2. Only admins can create/edit products
3. Users can only modify their data
```

### Payment Security
```
1. Razorpay handles card data (PCI-DSS compliant)
2. Signature verification on server
3. Order validation before payment
4. Payment status stored in database
```

### Data Protection
```
1. HTTPS for all connections
2. Environment variables for secrets
3. SQL injection prevention via Prisma
4. XSS protection via React
5. CSRF tokens in forms
```

## Performance Optimization

### Frontend
```
- Next.js Image Optimization
- Code Splitting via Route-based Chunking
- Lazy Loading Components
- CSS-in-JS with Tailwind (no runtime)
- Framer Motion animations (optimized)
```

### Backend
```
- Database Indexing
- Query Optimization via Prisma
- Pagination for large datasets
- Caching strategies
- API response compression
```

### Deployment
```
- Vercel CDN for static assets
- Image CDN via Cloudinary
- Database read replicas (optional)
- Cache headers optimization
```

## Scalability Considerations

### Current Architecture
- Single PostgreSQL database
- Next.js on Vercel
- Stateless API routes
- Client-side state management

### Future Scaling
1. **Database**: Add read replicas, implement caching layer (Redis)
2. **API**: Separate backend server with load balancing
3. **Frontend**: Static pre-rendering for product pages
4. **Search**: Implement ElasticSearch for product search
5. **Storage**: S3 for image storage, CloudFront for CDN
6. **Monitoring**: Add analytics and error tracking

## Environment Configuration

```yaml
Development:
  - Local PostgreSQL
  - Razorpay test keys
  - Cloudinary dev account
  - Clerk dev project

Staging:
  - Cloud PostgreSQL
  - Razorpay test keys
  - Cloudinary staging
  - Clerk staging project

Production:
  - Cloud PostgreSQL with backups
  - Razorpay live keys
  - Cloudinary production
  - Clerk production project
```

## Deployment Pipeline

```
Code Push to GitHub
    ↓
GitHub Actions (or Vercel auto-deploy)
    ↓
Run Tests & Linting
    ↓
Build Next.js Application
    ↓
Run Database Migrations (if needed)
    ↓
Deploy to Vercel
    ↓
Update Environment Variables
    ↓
Verify Deployment
    ↓
Monitor Logs & Errors
```

## File Organization Best Practices

```
/ (root)
├── app/              (Next.js 13+ App Router)
│   └── Use for all pages and layouts
├── pages/api/        (API routes)
│   └── Keep business logic in lib/
├── src/              (Application code)
│   ├── components/   (Reusable UI components)
│   ├── lib/          (Utilities and business logic)
│   ├── context/      (React Context providers)
│   ├── hooks/        (Custom React hooks)
│   ├── types/        (TypeScript types and interfaces)
│   └── styles/       (Global styles)
├── prisma/           (Database schema and migrations)
├── public/           (Static assets)
└── (config files)    (package.json, tsconfig, etc.)
```

---

**Total Estimated Tokens**: 15,000+
**Development Time**: 40-60 hours to production
**Ready for Scale**: Yes, with future optimizations

