# Jaycina Portfolio Backend Setup

This guide will help you set up a backend for your Jaycina portfolio using Supabase, Prisma, and a custom CMS.

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 2. Environment Variables
Create a `.env.local` file with:

```env
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View your data
npx prisma studio
```

### 4. Start Development Server
```bash
npm run dev
```

## 📱 CMS Features

Visit `/cms` to access the content management system:

- ✅ **Add Products**: Create new crochet items
- ✅ **Edit Products**: Update existing products
- ✅ **Delete Products**: Soft delete (marks as inactive)
- ✅ **Manage Categories**: Organize by Scarves, Beanies, etc.
- ✅ **Dual Pricing**: INR and GBP prices
- ✅ **Image Management**: Multiple images per product
- ✅ **Materials List**: Specify yarn types and details

## 🗄️ Database Schema

### Products Table
- `id`: Unique identifier
- `title`: Product name
- `category`: Product category
- `priceInr`: Price in Indian Rupees
- `priceGbp`: Price in British Pounds
- `short`: Short description
- `description`: Detailed description
- `materials`: Array of materials used
- `images`: Array of image URLs
- `isActive`: Whether product is visible
- `createdAt`/`updatedAt`: Timestamps

### Additional Tables
- `about_sections`: Manage about page content
- `process_steps`: Craft process steps
- `testimonials`: Customer reviews
- `site_settings`: Global site settings

## 🔧 API Endpoints

- `GET /api/products` - Fetch all active products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Fetch single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Soft delete product

## 💡 Benefits

- ✅ **Free Tier**: Supabase offers generous free limits
- ✅ **Real-time**: Updates reflect immediately
- ✅ **Scalable**: Easy to add more features
- ✅ **Secure**: Built-in authentication and security
- ✅ **CMS**: Easy content management
- ✅ **Mobile**: Works on all devices

## 🎯 Next Steps

1. **Authentication**: Add admin login for CMS
2. **Image Upload**: Direct image upload to Supabase Storage
3. **Orders**: Track customer orders
4. **Analytics**: Monitor product views and sales
5. **SEO**: Dynamic meta tags for products

## 📞 Support

The CMS is now integrated with your existing frontend. All products will automatically appear on your portfolio website!


