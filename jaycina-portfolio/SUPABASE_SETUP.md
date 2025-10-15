# Supabase + Prisma + Authentication Setup Guide

## 🚀 Complete Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your:
   - Project URL
   - Anon key
   - Service role key
   - Database password

### 2. Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URLs (from Supabase)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# (Optional) View your data
npx prisma studio
```

### 4. Authentication Setup

1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user or use the SQL editor:

```sql
-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@jaycina.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

### 5. Storage Setup (Optional)

1. Go to Supabase Dashboard → Storage
2. Create a bucket called `product-images`
3. Set it to public if you want public access

### 6. Start Development

```bash
npm run dev
```

### 7. Access Points

- **Main Website**: http://localhost:3000
- **CMS Login**: http://localhost:3000/login
- **CMS Dashboard**: http://localhost:3000/cms

### 8. Default Login Credentials

- **Email**: admin@jaycina.com
- **Password**: admin123

## 🔧 Features Included

- ✅ **Authentication**: Secure login/logout
- ✅ **Database**: Prisma ORM with Supabase PostgreSQL
- ✅ **API Routes**: RESTful API for products
- ✅ **CMS**: Full content management system
- ✅ **Storage**: Ready for image uploads
- ✅ **Security**: Protected admin routes

## 🎯 Next Steps

1. **Customize**: Update branding and content
2. **Images**: Set up Supabase Storage for image uploads
3. **Email**: Configure email authentication
4. **Deploy**: Deploy to Vercel/Netlify
5. **Domain**: Connect custom domain

## 📞 Support

The setup is now complete with authentication, database, and CMS functionality!


