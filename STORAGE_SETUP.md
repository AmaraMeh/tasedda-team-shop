# Storage Setup for Product Images

This document explains how to set up Supabase storage for product image uploads.

## Prerequisites

- Supabase project with storage enabled
- Supabase CLI installed and configured

## Setup Steps

### 1. Run the Migration

The storage bucket and policies are automatically created when you run the migration:

```bash
supabase db push
```

This will create:
- A `product-images` storage bucket
- Policies for authenticated users to upload/update/delete images
- Public read access to product images

### 2. Manual Setup (Alternative)

If you prefer to set up manually through the Supabase dashboard:

#### Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Click "Create a new bucket"
4. Set the following:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Enabled
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png`

#### Create Storage Policies

Run these SQL commands in the Supabase SQL editor:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Allow public read access to product images
CREATE POLICY "Allow public read access to product images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images'
);

-- Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);
```

## Features

The image upload system supports:

- **File Upload**: Drag & drop or click to select PNG/JPEG files (max 5MB)
- **URL Input**: Direct URL input for existing images
- **Preview**: Real-time preview of selected images
- **Validation**: File type and size validation
- **Error Handling**: User-friendly error messages
- **Storage**: Automatic upload to Supabase storage with public URLs

## Usage

The `ImageUpload` component can be used in any form:

```tsx
import ImageUpload from '@/components/ImageUpload';

<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  label="Product Image"
  placeholder="https://example.com/image.jpg"
/>
```

## File Structure

```
src/
├── components/
│   └── ImageUpload.tsx          # Main upload component
├── lib/
│   └── imageUpload.ts           # Upload utility functions
└── pages/
    ├── admin/
    │   └── Products.tsx         # Admin product management
    └── AddProduct.tsx           # Seller product creation
```

## Security

- Only authenticated users can upload images
- File types are restricted to PNG/JPEG
- File size is limited to 5MB
- Public read access for displaying images
- Users can only manage their own uploaded images 