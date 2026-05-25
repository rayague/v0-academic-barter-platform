-- =====================================================
-- SUPABASE SQL EDITOR - À Exécuter Immédiatement
-- FIX: RLS Policy pour Notifications
-- =====================================================

-- 1. Vérifier les policies actuelles
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

-- 2. SUPPRIMER l'ancienne policy (trop restrictive)
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;

-- 3. CRÉER une nouvelle policy (plus permissive)
CREATE POLICY "Authenticated can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- 4. VÉRIFIER que c'est bien appliqué
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

-- 5. Tester l'insertion (si tu veux)
-- INSERT INTO public.notifications (
--   recipient_id,
--   actor_id,
--   type,
--   data
-- ) VALUES (
--   'uuid-recipient',
--   'uuid-actor',
--   'test',
--   '{}'::jsonb
-- ) RETURNING *;
