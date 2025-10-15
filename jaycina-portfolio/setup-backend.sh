#!/bin/bash

echo "🚀 Setting up Jaycina Portfolio Backend"
echo "======================================"

echo "📦 Installing additional dependencies..."
npm install @supabase/supabase-js prisma @prisma/client

echo "🔧 Setting up Prisma..."
npx prisma generate

echo "📋 Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Copy your database URL and keys to .env.local"
echo "3. Run: npx prisma db push"
echo "4. Visit /cms to manage your products"
echo ""
echo "📝 Environment variables needed:"
echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
echo "NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]"
echo "SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]"
echo ""
echo "✅ Setup complete! Run 'npm run dev' to start the development server."


