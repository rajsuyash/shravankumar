/*
  # Update Circuits RLS Policy for Public Access

  1. Changes
    - Drop the existing "Anyone can view active circuits" policy that requires authentication
    - Create new policy allowing anonymous users to view active circuits
    
  2. Security
    - Maintains data protection by only allowing read access to active circuits
    - No authentication required for browsing circuits (public marketplace)
*/

DROP POLICY IF EXISTS "Anyone can view active circuits" ON circuits;

CREATE POLICY "Public can view active circuits"
  ON circuits FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
