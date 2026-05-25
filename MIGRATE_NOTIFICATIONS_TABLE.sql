-- =====================================================
-- 🔧 MIGRATION: Corriger la Table Notifications
-- =====================================================
-- ⚠️ À exécuter DANS Supabase SQL Editor
-- ⚠️ Va SUPPRIMER et RECRÉER la table
-- =====================================================

-- 1. SUPPRIMER les policies existantes (s'ils existent)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;

-- 2. SUPPRIMER la table existante
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 3. CRÉER LA NOUVELLE TABLE (CORRECTE)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRÉER LES INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 5. ENABLE RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. CRÉER LES POLICIES (correctes)
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id);

CREATE POLICY "Authenticated can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = recipient_id);

-- 7. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

-- =====================================================
-- ✅ Migration Complète!
-- =====================================================
-- Teste:
-- SELECT * FROM notifications LIMIT 1;
