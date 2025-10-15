# Complete Supabase Setup Guide

## 🎯 Step-by-Step Supabase Configuration

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project details:
   - **Name**: `jaycina-portfolio`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### 2. Get Your Credentials

#### **Project URL & Keys**
1. In your Supabase dashboard
2. Go to **Settings** (⚙️) → **API**
3. Copy these values:

```env
# From Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Database Connection**
1. Still in **Settings** → **API**
2. Scroll to **Database** section
3. Copy the connection string:

```env
# Database connection (replace [YOUR-PASSWORD] with your actual password)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

### 3. Set Up Storage Bucket

#### **Create Product Images Bucket**
1. In Supabase dashboard
2. Click **Storage** in left sidebar
3. Click **New bucket**
4. Configure:
   - **Name**: `product-images`
   - **Public bucket**: ✅ (checked)
   - **File size limit**: `50MB`
   - **Allowed MIME types**: `image/*`
5. Click **Create bucket**

#### **Upload Test Images**
1. Click on your `product-images` bucket
2. Click **Upload file**
3. Upload some product images
4. Copy the public URLs for your products

### 4. Set Up Authentication

#### **Create Admin User**
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter:
   - **Email**: `admin@jaycina.com`
   - **Password**: `admin123`
   - **Auto Confirm User**: ✅
4. Click **Create user**

### 5. Configure Your App

#### **Create .env.local File**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URLs
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
```

#### **Run Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View your database
npx prisma studio
```

### 6. Test Your Setup

#### **Start Development Server**
```bash
npm run dev
```

#### **Test Access Points**
- **Main Site**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **CMS**: http://localhost:3000/cms

#### **Login Credentials**
- **Email**: `admin@jaycina.com`
- **Password**: `admin123`

## 🔍 **Why We Need Both Systems**

### **Supabase Client (Browser)**
- ✅ **User Authentication**: Login/logout
- ✅ **File Uploads**: Images to storage buckets
- ✅ **Real-time**: Live updates
- ✅ **Security**: Row Level Security (RLS)

### **Prisma + PostgreSQL (Server)**
- ✅ **API Routes**: Server-side operations
- ✅ **Type Safety**: Generated TypeScript types
- ✅ **Migrations**: Database schema changes
- ✅ **Performance**: Direct database queries

## 📁 **File Structure**
```
jaycina-portfolio/
├── .env.local                 # Your Supabase credentials
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   └── prisma.ts         # Prisma client
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication
│   └── app/
│       ├── login/page.tsx     # Login page
│       └── cms/page.tsx       # CMS dashboard
└── pages/api/                # API routes
```

## 🎯 **What Each System Does**

| System | Purpose | Where Used |
|--------|---------|------------|
| **Supabase Client** | Authentication, Storage, Real-time | Browser, React components |
| **Prisma + PostgreSQL** | Database operations, API routes | Server-side, API endpoints |
| **Storage Buckets** | Image files | Product images, file uploads |

## 🚀 **Next Steps**

1. **Create Supabase Project** (5 minutes)
2. **Get Credentials** (2 minutes)
3. **Set Environment Variables** (1 minute)
4. **Run Database Setup** (2 minutes)
5. **Test Everything** (5 minutes)

**Total Setup Time: ~15 minutes!**

The system is designed to be secure, scalable, and easy to manage. Supabase handles the complex parts (auth, storage, real-time) while Prisma gives you type-safe database access.


