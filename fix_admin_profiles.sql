-- 1. Add is_admin column to profiles (safe, won't break existing code)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Mark admin.dyo@dyo.com as admin in profiles
UPDATE profiles SET is_admin = true
WHERE email = 'admin.dyo@dyo.com';

-- 3. Drop ALL recursive policies on admins table to stop 500 errors
DROP POLICY IF EXISTS "Admins can view admins" ON admins;
DROP POLICY IF EXISTS "Admins can view themselves" ON admins;
DROP POLICY IF EXISTS "Super admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admin can update admins" ON admins;

-- 4. Create minimal NON-recursive policies for admins table
CREATE POLICY "admins_self_select" ON admins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "admins_signup_insert" ON admins FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Keep existing update policy (only if it exists and is not recursive)
-- We'll handle admin management via profiles.is_admin + service_role key
