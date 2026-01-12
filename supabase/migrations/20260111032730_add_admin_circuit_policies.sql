/*
  # Add Admin Policies for Circuits Management

  1. Security Changes
    - Add INSERT policy for admin users to create new circuits
    - Add UPDATE policy for admin users to modify existing circuits
    - Add DELETE policy for admin users to remove circuits
    
  2. Notes
    - Policies check if user has admin user_type in users table
    - Only users with user_type = 'admin' can manage circuits
*/

-- Policy for admins to insert new circuits
CREATE POLICY "Admins can insert circuits"
  ON circuits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Policy for admins to update circuits
CREATE POLICY "Admins can update circuits"
  ON circuits
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Policy for admins to delete circuits
CREATE POLICY "Admins can delete circuits"
  ON circuits
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );