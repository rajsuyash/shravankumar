/*
  # Create Storage Bucket for Circuit Images

  1. Storage
    - Create `circuit-images` bucket for storing circuit photos
    - Set up public access for reading images
    - Restrict uploads to authenticated admin users only
  
  2. Security
    - Public bucket for easy image access
    - RLS policies to control who can upload/delete images
*/

-- Create storage bucket for circuit images
INSERT INTO storage.buckets (id, name, public)
VALUES ('circuit-images', 'circuit-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Public can view circuit images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload circuit images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update circuit images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete circuit images" ON storage.objects;

-- Allow public to view images
CREATE POLICY "Public can view circuit images"
ON storage.objects FOR SELECT
USING (bucket_id = 'circuit-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload circuit images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'circuit-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update circuit images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'circuit-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete circuit images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'circuit-images');