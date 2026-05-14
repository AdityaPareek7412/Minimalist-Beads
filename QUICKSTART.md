# Quick Start Guide - MinimalistBeads

Get the project running locally in 10 minutes.

## System Requirements

- Node.js 18 or higher
- PostgreSQL 12 or higher
- Git
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

### 3. Configure Database

```bash
# Create PostgreSQL database
createdb minimalist_beads

# Or update DATABASE_URL in .env.local with your database

# Run migrations
npx prisma migrate dev
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Data

The app comes with sample data:
- 8 featured products
- 5 product categories
- Mock pricing and images

## Common Commands

```bash
# Development
npm run dev         # Start dev server

# Production
npm run build       # Build for production
npm run start       # Start production server

# Database
npx prisma migrate dev              # Create new migration
npx prisma studio                   # Open database UI
npx prisma db seed                  # Seed with sample data
npx prisma db push                  # Push schema changes

# Code Quality
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run type-check  # Run TypeScript check
```

## File Structure Quick Reference

```
app/              → Pages and routes
src/components/   → React components
src/lib/          → Utilities and database
src/types/        → TypeScript types
pages/api/        → API endpoints
prisma/           → Database schema
```

## Testing the Features

### 1. Browse Products
- Go to `/shop`
- Filter by category, price
- Sort by newest, trending

### 2. View Product Details
- Click any product card
- View gallery and details
- See related products

### 3. Shopping Cart
- Add products to cart
- Cart data persists in localStorage
- Update quantities

### 4. Checkout
- Go to `/cart` → "Proceed to Checkout"
- Fill address form
- Select payment method
- Review order

### 5. User Account
- Go to `/account`
- View profile
- See order history
- Manage addresses

## Environment Variables Explained

```bash
DATABASE_URL              # PostgreSQL connection string
NEXT_PUBLIC_RAZORPAY_KEY_ID   # Razorpay public key (keep test key for dev)
RAZORPAY_KEY_SECRET       # Razorpay private key (test mode)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  # Your Cloudinary cloud name
NEXT_PUBLIC_APP_URL       # Your app URL (http://localhost:3000 for dev)
```

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Verify CONNECTION_URL in .env.local
```

### Port 3000 Already in Use
```bash
# Kill process using port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# Or use different port:
npm run dev -- -p 3001
```

### Prisma Error
```bash
# Regenerate Prisma client
npx prisma generate

# Clear Prisma cache
rm -rf .next node_modules/.prisma
npm install
```

## Next Steps

1. **Customize Colors**: Edit `tailwind.config.ts`
2. **Add Products**: Use Prisma Studio: `npx prisma studio`
3. **Set Payment Keys**: Add Razorpay test keys to `.env.local`
4. **Configure Images**: Add Cloudinary credentials
5. **Add Authentication**: Install Clerk

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)

## Support

For issues:
1. Check the ERROR LOGS in terminal
2. Review `.env.local` configuration
3. Check PostgreSQL is running
4. Clear cache: `rm -rf .next`

---

**Ready to build?** Happy coding! 🚀

