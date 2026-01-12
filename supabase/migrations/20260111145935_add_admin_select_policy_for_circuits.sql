/*
  # Add Admin SELECT Policy for Circuits
  
  1. Security Changes
    - Add SELECT policy allowing admins to view all circuits (active and inactive)
    - This fixes the issue where updates return empty arrays because admins can only
      read active circuits through the existing public SELECT policy
  
  2. Notes
    - Admins need to view all circuits in the admin dashboard, not just active ones
    - The existing public SELECT policy remains for non-admin users
*/

-- Policy for admins to select all circuits (including inactive ones)
CREATE POLICY "Admins can select all circuits"
  ON circuits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );
