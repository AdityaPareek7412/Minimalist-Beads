#!/bin/bash
# setup.sh - Automated setup script

echo "🚀 MinimalistBeads - Setup Script"
echo "=================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm $(npm --version) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo "⚠️  Please update .env.local with your credentials"
else
    echo "⚠️  .env.local already exists, skipping..."
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"

# Run database migrations
echo ""
echo "🗄️  Setting up database..."
echo "Make sure PostgreSQL is running and DATABASE_URL is set correctly in .env.local"
echo ""
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name init
    
    if [ $? -eq 0 ]; then
        echo "✅ Database migrations completed"
    else
        echo "❌ Database migrations failed"
        echo "Run manually: npx prisma migrate dev"
    fi
else
    echo "⏭️  Skipping migrations. Run later with: npx prisma migrate dev"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "Documentation:"
echo "- QUICKSTART.md - Quick setup guide"
echo "- README.md - Full documentation"
echo "- ARCHITECTURE.md - Technical architecture"
