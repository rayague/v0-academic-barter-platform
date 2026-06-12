-- Exécuter tout ce bloc dans Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Créer les fonctions SECURITY DEFINER qui BYPASS RLS (pas de récursion)
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 2. Supprimer les anciennes policies récursives sur admins
DROP POLICY IF EXISTS "Admins can view admins" ON admins;
DROP POLICY IF EXISTS "Admins can view themselves" ON admins;
DROP POLICY IF EXISTS "Super admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Super admin can update admins" ON admins;
DROP POLICY IF EXISTS "Admins can signup" ON admins;

-- 3. Créer les nouvelles policies NON-récursives
CREATE POLICY "Admins can view admins"
    ON admins FOR SELECT
    USING (auth.uid() = user_id OR public.is_active_admin());

CREATE POLICY "Admins can signup"
    ON admins FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin can update admins"
    ON admins FOR UPDATE
    USING (public.is_super_admin());

-- 4. Recreate reports policies (non-recursive)
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    USING (public.is_active_admin());

DROP POLICY IF EXISTS "Admins can update reports" ON reports;
CREATE POLICY "Admins can update reports"
    ON reports FOR UPDATE
    USING (public.is_active_admin());

-- 5. Recreate user_bans policies (non-recursive)
DROP POLICY IF EXISTS "Admins can view user bans" ON user_bans;
CREATE POLICY "Admins can view user bans"
    ON user_bans FOR SELECT
    USING (public.is_active_admin());

DROP POLICY IF EXISTS "Admins can insert user bans" ON user_bans;
CREATE POLICY "Admins can insert user bans"
    ON user_bans FOR INSERT
    WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "Admins can update user bans" ON user_bans;
CREATE POLICY "Admins can update user bans"
    ON user_bans FOR UPDATE
    USING (public.is_active_admin());
