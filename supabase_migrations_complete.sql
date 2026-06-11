-- =====================================================
-- Activer les annonces bloquées en pending_payment
-- =====================================================
-- Exécuter DANS L'ORDRE : supabase_schema.sql PUIS ce fichier
-- =====================================================

-- Rendre toutes les annonces en attente de paiement actives immédiatement
UPDATE listings SET status = 'active' WHERE status = 'pending_payment';

-- Vérifier le résultat
SELECT id, title, status, created_at FROM listings ORDER BY created_at DESC LIMIT 20;
