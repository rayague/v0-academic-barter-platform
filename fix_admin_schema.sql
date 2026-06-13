-- =====================================================
-- ADMIN PANEL SCHEMA MIGRATION
-- Execute this AFTER fix_admin_profiles.sql
-- =====================================================

-- 1. REPORTS TABLE: Add columns for admin workflow
-- Add report_type column (code uses this instead of reason)
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_type TEXT NOT NULL DEFAULT 'other';

-- Add resolved_by and resolved_at for admin resolution tracking
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Update status CHECK constraint to include open/in_review
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
UPDATE reports SET status = 'open' WHERE status = 'pending';
UPDATE reports SET status = 'in_review' WHERE status = 'reviewed';
ALTER TABLE reports ADD CONSTRAINT reports_status_check
  CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed'));

-- 2. EXCHANGES: Add admin SELECT policy (dashboard stats)
DROP POLICY IF EXISTS "Admins can view all exchanges" ON exchanges;
CREATE POLICY "Admins can view all exchanges" ON exchanges FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 3. ADMINS: Non-recursive policies (query profiles not admins to avoid recursion)
-- SELECT: user sees own row, or any admin sees all
DROP POLICY IF EXISTS "admins_self_select" ON admins;
DROP POLICY IF EXISTS "admins_select" ON admins;
CREATE POLICY "admins_select" ON admins FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- UPDATE: only admins can update (super_admin check done at app/UI level)
DROP POLICY IF EXISTS "admins_update" ON admins;
CREATE POLICY "admins_update" ON admins FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- INSERT: user can insert their own signup row
DROP POLICY IF EXISTS "admins_signup_insert" ON admins;
CREATE POLICY "admins_signup_insert" ON admins FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Drop the recursive function (no longer needed)
DROP FUNCTION IF EXISTS public.check_super_admin();
