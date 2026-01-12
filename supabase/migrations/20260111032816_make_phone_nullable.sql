/*
  # Make Phone Field Nullable in Users Table

  1. Changes
    - Make phone field nullable to allow users to sign up without providing phone initially
    - They can add phone later in their profile
    
  2. Notes
    - This allows for more flexible user registration flow
    - Phone can be added later during profile completion
*/

-- Make phone field nullable
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;