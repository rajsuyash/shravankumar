/*
  # Auto-create User Profile on Signup

  1. New Functions
    - `handle_new_user()` - Automatically creates a user profile in public.users when auth.users entry is created
    - First user is automatically set as admin, subsequent users are customers by default
    
  2. Security
    - Ensures every authenticated user has a corresponding profile
    - Simplifies user management by auto-populating user records
    
  3. Notes
    - Trigger fires on auth.users INSERT
    - Sets user_type to 'admin' for first user, 'customer' for others
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users to determine if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.users;
  
  -- Insert new user profile
  INSERT INTO public.users (id, email, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN user_count = 0 THEN 'admin'
      ELSE 'customer'
    END,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();