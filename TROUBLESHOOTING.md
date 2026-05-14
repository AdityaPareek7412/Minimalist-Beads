# Troubleshooting Guide - MinimalistBeads

Common issues and solutions.

## Installation Issues

### ❌ "Node.js not found"

**Problem**: Command not found when running `node --version`

**Solutions**:
1. Download from https://nodejs.org/ (18+)
2. After install, restart terminal/IDE
3. Verify: `node --version` (should show v18+)

### ❌ "npm ERR! 404 Not Found"

**Problem**: Package not found in npm registry

**Solutions**:
1. Check typo in `package.json`
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` & `package-lock.json`
4. Run: `npm install` again

### ❌ Port 3000 already in use

**Problem**: "Error: listen EADDRINUSE: address already in use :::3000"

**Solutions**:

**Windows**:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

**Mac/Linux**:
```bash
lsof -i :3000
kill -9 <PID>
npm run dev
```

**Alternative**:
```bash
npm run dev -- -p 3001
```

### ❌ "Cannot find module"

**Problem**: Module import errors

**Solutions**:
1. Reinstall dependencies: `npm install`
2. Clear cache: `npm cache clean`
3. Delete `.next`: `rm -rf .next`
4. Verify imports match file names (case-sensitive on Linux/Mac)

### ❌ "ERR_PNPM_UNSUPPORTED_PROTOCOL"

**Problem**: Using pnpm instead of npm

**Solution**:
```bash
npm install -g npm
npm install
npm run dev
```

---

## Database Issues

### ❌ "connect ECONNREFUSED 127.0.0.1:5432"

**Problem**: PostgreSQL not running or wrong connection

**Solutions**:

**Windows**:
1. Check Services: Press `Win+R` → `services.msc`
2. Find "PostgreSQL" service
3. Right-click → Start

**Mac** (with Homebrew):
```bash
brew services start postgresql
```

**Linux**:
```bash
sudo systemctl start postgresql
```

**Or verify connection**:
```bash
psql -h localhost -U postgres
```

### ❌ "role postgres does not exist"

**Problem**: PostgreSQL user not set up

**Solutions**:
```bash
# Windows (in postgres shell)
CREATE ROLE postgres WITH LOGIN PASSWORD 'password';
ALTER ROLE postgres WITH CREATEDB;

# Then in .env.local:
DATABASE_URL="postgresql://postgres:password@localhost:5432/minimalist_beads"
```

### ❌ Database already exists

**Problem**: Error during `npx prisma migrate dev`

**Solutions**:
```bash
# Drop database
dropdb minimalist_beads

# Recreate
createdb minimalist_beads

# Run migrations
npx prisma migrate dev --name init
```

### ❌ Migration conflict

**Problem**: Pending migrations from bad state

**Solutions**:
```bash
# Reset database (WARNING: DESTRUCTIVE)
npx prisma migrate reset

# Or resolve manually
npx prisma migrate resolve --rolled-back <migration_name>
```

### ❌ "Prisma Client not generated"

**Problem**: Type errors about Prisma Client

**Solutions**:
```bash
npx prisma generate
npm run dev
```

---

## Environment Variable Issues

### ❌ "process.env.DATABASE_URL is undefined"

**Problem**: Missing .env.local file

**Solutions**:
```bash
# Create from example
cp .env.example .env.local

# OR create manually:
# Add this to .env.local:
DATABASE_URL=postgresql://user:password@localhost:5432/minimalist_beads
```

### ❌ "RAZORPAY_KEY_SECRET is undefined"

**Problem**: Missing payment credentials

**Solutions**:
1. Go to https://razorpay.com/dashboard
2. Get test/live keys
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=test_xxxxx
   ```
4. Restart dev server

### ❌ ".env.local is ignored by git"

**Problem**: Not seeing changes to environment variables

**Solution**:
```bash
# Make sure .gitignore has:
.env.local
.env.*.local

# Then restart server
npm run dev
```

---

## Build Issues

### ❌ "Failed to compile. SyntaxError: Unexpected token"

**Problem**: TypeScript or syntax error

**Solutions**:
1. Check error message for line number
2. Look for missing commas/semicolons
3. Verify imports are correct
4. Check file names match imports (case-sensitive)

**Example fix**:
```typescript
// ❌ Wrong
import {useCart} from '@/context/cartContext'

// ✅ Right (with correct path and brace spacing)
import { useCart } from '@/context/cartContext'
```

### ❌ "TypeScript error"

**Problem**: Type mismatch

**Solutions**:
```bash
# Run type checker
npm run type-check

# Or in build
npm run build

# Check error message carefully and fix types
```

### ❌ ".next folder too large"

**Problem**: Build cache is huge

**Solution**:
```bash
rm -rf .next
npm run build
```

---

## Runtime Issues

### ❌ "Cannot GET /"

**Problem**: Page not loading, shows 404

**Solutions**:
1. Check `app/page.tsx` exists
2. Check imports in layout
3. Check console for errors
4. Clear browser cache: `Ctrl+Shift+Del`

### ❌ Cart data not persisting

**Problem**: Items disappear after refresh

**Solution**: This is EXPECTED with localStorage (session-based). 
To add user persistence:
1. Save to database when user logs in
2. Load from database on app start

### ❌ Images not loading

**Problem**: 404 on images

**Solutions**:
1. Check image URLs are correct
2. Verify Cloudinary credentials in `.env.local`
3. Check CORS settings if using external CDN
4. Use Next.js Image component:
   ```typescript
   import Image from 'next/image'
   ```

### ❌ Payment modal not showing

**Problem**: Razorpay modal doesn't appear

**Solutions**:
1. Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env.local`
2. Check browser console for errors
3. Verify order was created:
   ```bash
   npx prisma studio
   # Check orders table
   ```
4. Use test keys for testing

---

## API Issues

### ❌ "405 Method Not Allowed"

**Problem**: Wrong HTTP method

**Solutions**:
1. Check API.md for correct method (GET/POST/PUT/DELETE)
2. Check your request matches documentation
3. Verify endpoint path

**Example**:
```javascript
// ❌ Wrong
fetch('/api/products', { method: 'DELETE' })

// ✅ Right (if API supports it)
fetch('/api/products/[id]', { method: 'DELETE' })
```

### ❌ "401 Unauthorized"

**Problem**: Missing or invalid authentication

**Solutions**:
1. Verify user is logged in
2. Check JWT token exists
3. Verify token hasn't expired
4. Check Clerk/Auth setup

### ❌ "500 Internal Server Error"

**Problem**: Server-side error

**Solutions**:
1. Check server logs (`npm run dev` terminal)
2. Check database connection
3. Verify environment variables
4. Check database query errors

### ❌ "CORS error"

**Problem**: Cross-origin request blocked

**Solution**: Usually appears in frontend to external APIs.
Add to headers in API route:
```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
}
```

---

## Deployment Issues

### ❌ "Vercel deployment failed"

**Problem**: Build failed on Vercel

**Solutions**:
1. Check build logs on Vercel dashboard
2. Verify all environment variables are set
3. Run locally: `npm run build`
4. Common fixes:
   ```bash
   rm -rf .next
   npm install
   npm run build
   ```

### ❌ "Database connection timeout on Vercel"

**Problem**: Can't connect to database from Vercel

**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Add Vercel IP to database firewall
3. Check database is online
4. Test locally first:
   ```bash
   npm run dev
   npx prisma studio
   ```

### ❌ "Vercel builds but crashes on runtime"

**Problem**: 500 error when accessing site

**Solutions**:
1. Check Vercel function logs
2. Verify environment variables
3. Check database migrations ran
4. Verify API routes work locally

---

## Performance Issues

### ❌ "Page loads slowly"

**Problem**: Slow page load

**Solutions**:
1. Check Lighthouse: F12 → Lighthouse
2. Optimize images:
   ```bash
   # Use Next.js Image component
   import Image from 'next/image'
   ```
3. Enable caching in `next.config.js`
4. Check database queries for N+1 problems

### ❌ "Large bundle size"

**Problem**: `/api/build` shows large bundle

**Solutions**:
1. Check what's being imported
2. Use dynamic imports:
   ```typescript
   const Component = dynamic(() => import('./Component'))
   ```
3. Remove unused packages
4. Check for large dependencies in `package.json`

---

## Development Environment Issues

### ❌ "VS Code loses autocomplete"

**Problem**: IntelliSense not working

**Solutions**:
1. Restart VS Code
2. Delete `.next` and rebuild
3. Kill TypeScript language server: `F1` → "Restart TS Server"
4. Reinstall Pylance/TypeScript extensions

### ❌ "Prettier not formatting on save"

**Problem**: Auto-format not working

**Solution**:
1. Install Prettier extension in VS Code
2. Set as default formatter:
   - F1 → "Format Document"
   - Select "Prettier"
3. Enable "Format on Save" in settings

### ❌ "ESLint showing fake errors"

**Problem**: Linter shows errors that don't exist

**Solutions**:
1. Reload VS Code window: `F1` → "Reload Window"
2. Reinstall ESLint extension
3. Check `.eslintrc.json` configuration

---

## Common Mistakes

### ❌ Forgetting to create .env.local

**Fix**:
```bash
cp .env.example .env.local
# Fill in all values
npm run dev
```

### ❌ Modifying schema without migration

**Fix**:
```bash
# If schema changed
npx prisma migrate dev --name <description>
```

### ❌ Using `npm run dev` but port already taken

**Fix**:
```bash
npm run dev -- -p 3001
```

### ❌ Git tracking `.env.local`

**Fix**:
```bash
# Delete from git but keep locally
git rm --cached .env.local

# Verify .gitignore has it
echo ".env.local" >> .gitignore

# Commit
git add .gitignore
git commit -m "Remove .env.local from tracking"
```

---

## Getting More Help

### Check Logs
```bash
# Terminal logs
# Look in npm run dev output

# Browser console
# F12 → Console tab

# Browser Network
# F12 → Network tab (check API calls)

# Vercel logs
# vercel logs (if deployed)
```

### Check Files
1. **Type errors**: Check `src/types/index.ts`
2. **API errors**: Check `pages/api/`
3. **Build errors**: Check `next.config.js`
4. **Database errors**: Check `prisma/schema.prisma`

### Useful Commands
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start

# Prisma UI
npx prisma studio
```

### External Resources
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Node.js: https://nodejs.org/docs
- PostgreSQL: https://www.postgresql.org/docs/

---

## Quick Reset (Nuclear Option)

If everything breaks, try this:

```bash
# 1. Stop server (Ctrl+C)

# 2. Deep clean
rm -rf node_modules .next .env.local
rm package-lock.json

# 3. Reinstall
npm install

# 4. Copy env
cp .env.example .env.local
# Edit .env.local with your values

# 5. Reset database
npx prisma migrate reset

# 6. Start fresh
npm run dev
```

---

**Still stuck?**

1. Search your error message online
2. Check GitHub issues
3. Ask in Next.js/Prisma Discord
4. Review ALL console/terminal output (answers usually there!)

