-- Storage bucket for trip update photos
-- Run in Supabase SQL Editor

-- Create the storage bucket (public read, authenticated upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-update-photos',
  'trip-update-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload trip photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'trip-update-photos');

-- Allow public read access to trip photos
CREATE POLICY "Public can view trip photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'trip-update-photos');

-- Allow uploaders to delete their own photos
CREATE POLICY "Users can delete own trip photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'trip-update-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
