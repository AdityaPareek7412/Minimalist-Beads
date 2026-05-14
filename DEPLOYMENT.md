# Deployment Guide - MinimalistBeads

Complete step-by-step deployment instructions for production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Contact information added
- [ ] Social media links configured
- [ ] Payment keys verified
- [ ] Images optimized
- [ ] SEO metadata added
- [ ] 404 and error pages created
- [ ] Analytics configured
- [ ] SSL certificate ready
- [ ] Backup strategy planned

## 1. Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit: MinimalistBeads ecommerce platform"

# Create GitHub repository
# Push to GitHub
git remote add origin https://github.com/yourusername/minimalist-beads.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repository
4. Select the repository

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Step 4: Deploy

Click "Deploy" button. Vercel will:
- Run build
- Run migrations (if configured)
- Deploy to CDN

## 2. Database Deployment

### Option A: Render PostgreSQL

1. Go to [render.com](https://render.com)
2. Create New → PostgreSQL Database
3. Set database name: `minimalist_beads`
4. Copy connection string
5. Add to `.env`: `DATABASE_URL=...`

### Option B: AWS RDS

1. Go to AWS Console
2. RDS → Create Database
3. PostgreSQL engine
4. Dev/Test configuration
5. Get connection string
6. Add to `.env`

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → PostgreSQL
3. Copy Internal URL
4. Add to Vercel environment variables

### Running Migrations

After database is set up:

```bash
# Local
npx prisma migrate deploy

# Production (via Vercel)
# Create a deployment script or run manually:
NPX_SKIP_UPDATE=1 npx prisma migrate deploy
```

## 3. Payment Setup - Razorpay

### Live Account Setup

1. Go to [razorpay.com](https://razorpay.com)
2. Create business account
3. Complete KYC verification
4. Dashboard → Settings → API Keys
5. Copy Live Key ID and Secret
6. Add to environment variables

### Testing Payments

```bash
# Test credentials (before going live)
Razorpay Key: rzp_test_xxxxx
Secret: test_secret_xxxxx

# Test UPI
9876543210@paytm
123456
```

### Webhook Setup

1. Dashboard → Account Setup → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/razorpay`
3. Add events: `payment.authorized`, `payment.failed`
4. Create webhook secret
5. Verify signature in code

## 4. Image CDN - Cloudinary

### Setup

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up free account
3. Dashboard → Get API credentials
4. Create `.env` variables:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxxxx
   CLOUDINARY_API_KEY=xxxxx
   CLOUDINARY_API_SECRET=xxxxx
   ```

### Uploading Images

```bash
# Create upload folder in Cloudinary
# Or use Cloudinary Media Library manually

# Set up automatic image optimization
# Dashboard → Settings → Transformations
```

## 5. Authentication - Clerk

### Setup

1. Go to [clerk.com](https://clerk.com)
2. Create application
3. Select "Next.js" template
4. Copy API keys
5. Add to environment:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
   CLERK_SECRET_KEY=sk_xxx
   ```

### Configuration

In [Dashboard](https://dashboard.clerk.com):
- Set Sign In URL: `/auth/sign-in`
- Set Sign Up URL: `/auth/sign-up`
- Set After Sign In URL: `/`
- Set After Sign Up URL: `/`

## 6. Domain & SSL

### Domain Registration

1. Buy domain from GoDaddy, Namecheap, or similar
2. Point nameservers to Vercel:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

### SSL Certificate

Vercel automatically provides free SSL certificates via Let's Encrypt.

### DNS Configuration

In Vercel → Project Settings → Domains:
- Add custom domain
- Update DNS records
- Wait for verification (usually 24-48 hours)

## 7. Email Configuration

### SendGrid Setup (for transactional emails)

```bash
1. Go to sendgrid.com
2. Create account
3. Verify domain
4. Get API key
5. Add to environment: SENDGRID_API_KEY=xxxxx
```

### Email Templates

Create in `lib/email/templates/`:
- Order confirmation
- Shipping notification
- Password reset
- Newsletter

## 8. Monitoring & Analytics

### Vercel Analytics

1. Vercel Dashboard → Analytics
2. View performance metrics
3. Monitor errors

### Google Analytics

1. Create account at [analytics.google.com](https://analytics.google.com)
2. Set up GA4 property
3. Add measurement ID to app

### Error Tracking (Sentry)

```bash
1. Go to sentry.io
2. Create project
3. Select Next.js
4. Add to environment: NEXT_PUBLIC_SENTRY_DSN=xxxxx
```

## 9. Backup Strategy

### Database Backups

```bash
# Daily backups scheduled
# Enable automated backups in Render/RDS/Railway

# Manual backup command:
pg_dump DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Files Backup

- Cloudinary handles image backups
- Code backed up in GitHub
- Environment variables in password manager

## 10. Performance Optimization

### Vercel Analytics

```tsx
// Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Image Optimization

```bash
# All images via Cloudinary with automatic optimization
# Next.js Image component for local images
```

### Database Query Optimization

```tsql
-- Add indexes to frequently queried columns
CREATE INDEX idx_product_slug ON products(slug);
CREATE INDEX idx_product_category ON products(categoryId);
CREATE INDEX idx_order_user ON orders(userId);
CREATE INDEX idx_order_created ON orders(createdAt);
```

## 11. Scaling Checklist

- [ ] Add database read replicas
- [ ] Implement caching (Redis)
- [ ] Set up API rate limiting
- [ ] Configure CDN headers
- [ ] Add search indexing (ElasticSearch)
- [ ] Implement database connection pooling
- [ ] Set up monitoring alerts
- [ ] Plan traffic scaling

## 12. Security Hardening

### Headers

```javascript
// next.config.js
headers: async () => {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
      ],
    },
  ]
}
```

### Environment Variables

- Never commit `.env.local`
- Store secrets in Vercel dashboard
- Rotate keys regularly
- Use separate test and prod keys

### Rate Limiting

```typescript
// pages/api/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

export default limiter
```

## 13. Going Live Checklist

### Before Launch
- [ ] Test all payment flows
- [ ] Verify email notifications
- [ ] Check mobile responsiveness
- [ ] Test checkout on mobile
- [ ] Verify order creation
- [ ] Test coupon codes
- [ ] Check inventory sync
- [ ] Verify shipping calculations
- [ ] Test admin panel
- [ ] Check analytics
- [ ] Review error pages
- [ ] Test performance (Lighthouse)

### Launch Day
- [ ] Monitor error logs
- [ ] Check payment processing
- [ ] Verify email sending
- [ ] Monitor database performance
- [ ] Update DNS if needed
- [ ] Announce on social media
- [ ] Monitor user feedback

### Post-Launch
- [ ] Daily monitoring for 1 week
- [ ] Weekly security audits
- [ ] Monthly performance review
- [ ] Quarterly backup verification
- [ ] Regular content updates

## 14. Monitoring Commands

```bash
# View Vercel logs
vercel logs

# View build logs
vercel logs --follow

# Database query monitoring
npx prisma studio

# Performance check
npx lighthouse https://yourdomain.com
```

## 15. Rollback Procedure

```bash
# If deployment fails, Vercel automatically keeps previous version
# To manually rollback:
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "Redeploy"

# For database rollback:
npx prisma migrate resolve --rolled-back migration_name
```

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- Razorpay Docs: https://razorpay.com/docs/
- Cloudinary Docs: https://cloudinary.com/documentation
- Clerk Docs: https://clerk.com/docs

## Emergency Contacts

- Vercel Support: support@vercel.com
- Database Provider Support: Check dashboard
- Razorpay Support: support@razorpay.com
- Domain Registrar Support: Check your provider

---

**Estimated Deployment Time**: 2-3 hours for first-time setup
**Required Cost**: $0-50/month (free tier available)
**Live in**: 24-48 hours (including DNS propagation)

