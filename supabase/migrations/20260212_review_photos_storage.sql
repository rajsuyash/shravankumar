-- Create review-photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload review photos
CREATE POLICY "Authenticated users can upload review photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'review-photos');

-- Allow public read of review photos
CREATE POLICY "Public can view review photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'review-photos');

-- Allow users to delete their own review photos
CREATE POLICY "Users can delete own review photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
