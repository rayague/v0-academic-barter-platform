-- =====================================================
-- 🔐 CORRECTION: RLS Policies pour Notifications
-- =====================================================
-- ⚠️ À exécuter APRÈS avoir créé la table notifications
-- ✅ Policies simplifiées pour permettre les notifications
-- =====================================================

-- 1. SUPPRIMER les anciennes policies (s'ils existent)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

-- 2. CRÉER LES NOUVELLES POLICIES (SIMPLIFIÉES)

-- Policy: SELECT - Voir ses propres notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

-- Policy: INSERT - Tous les users authentifiés peuvent créer une notification
CREATE POLICY "Authenticated can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: UPDATE - Mettre à jour ses propres notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id);

-- Policy: DELETE - Supprimer ses propres notifications
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = recipient_id);

-- =====================================================
-- ✅ Policies RLS Créées avec Succès!
-- =====================================================
-- Les notifications peuvent maintenant être:
-- ✅ Créées par n'importe quel user authentifié
-- ✅ Lues/modifiées/supprimées seulement par le recipient
-- =====================================================
