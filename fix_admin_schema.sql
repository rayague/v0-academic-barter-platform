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

-- Migrate existing reason values to report_type
-- (reason in schema is analogous to what code calls report_type)
UPDATE reports SET report_type = reason WHERE report_type = 'other' AND reason IS NOT NULL;

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

-- 3. ADMINS: Add SECURITY DEFINER function for non-recursive super_admin check
CREATE OR REPLACE FUNCTION public.check_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
$$;

-- Add SELECT policy: see own row OR super_admin sees all
DROP POLICY IF EXISTS "admins_self_select" ON admins;
DROP POLICY IF EXISTS "admins_select" ON admins;
CREATE POLICY "admins_select" ON admins FOR SELECT
USING (auth.uid() = user_id OR public.check_super_admin());

-- Add UPDATE policy: only super_admin can update admins
DROP POLICY IF EXISTS "admins_update" ON admins;
CREATE POLICY "admins_update" ON admins FOR UPDATE
USING (public.check_super_admin());

-- Keep existing INSERT policy for signup
DROP POLICY IF EXISTS "admins_signup_insert" ON admins;
CREATE POLICY "admins_signup_insert" ON admins FOR INSERT
WITH CHECK (user_id = auth.uid());
