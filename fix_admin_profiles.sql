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
DROP POLICY IF EXISTS "admins_self_select" ON admins;
CREATE POLICY "admins_self_select" ON admins FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins_signup_insert" ON admins;
CREATE POLICY "admins_signup_insert" ON admins FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can signup" ON admins;

-- 5. Fix reports and user_bans policies (they referenced non-existent function)
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;

CREATE POLICY "Admins can view all reports" ON reports FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can update reports" ON reports FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Admins can view user bans" ON user_bans;
DROP POLICY IF EXISTS "Admins can insert user bans" ON user_bans;
DROP POLICY IF EXISTS "Admins can update user bans" ON user_bans;

CREATE POLICY "Admins can view user bans" ON user_bans FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can insert user bans" ON user_bans FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can update user bans" ON user_bans FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
