-- =====================================================
-- REQUÊTES SQL À EXÉCUTER DANS L'ÉDITEUR SUPABASE
-- Copier-coller tout le bloc dans l'éditeur SQL de Supabase
-- =====================================================

-- =====================================================
-- 1. AJOUT DE pending_payment DANS LA CONTRAINTE STATUS
-- =====================================================
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending_payment', 'active', 'reserved', 'completed', 'archived'));

-- Mettre à jour les annonces existantes sans statut
UPDATE listings SET status = 'active' WHERE status IS NULL OR status = '';


-- =====================================================
-- 2. TABLE user_bans (gestion des bannissements)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS user_bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    banned_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_is_active ON user_bans(is_active);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_bans_updated_at ON user_bans;
CREATE TRIGGER update_user_bans_updated_at
    BEFORE UPDATE ON user_bans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 3. RLS POLICIES POUR user_bans
-- =====================================================
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view user bans" ON user_bans;
CREATE POLICY "Admins can view user bans"
    ON user_bans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Admins can insert user bans" ON user_bans;
CREATE POLICY "Admins can insert user bans"
    ON user_bans FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Admins can update user bans" ON user_bans;
CREATE POLICY "Admins can update user bans"
    ON user_bans FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE user_id = auth.uid() AND is_active = true
        )
    );


-- =====================================================
-- 4. AJOUT DE LA COLONNE phone DANS profiles
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;


-- =====================================================
-- 5. RLS POLICY POUR payments (insertion par l'utilisateur)
-- =====================================================
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- =====================================================
-- 6. TRIGGER POUR NOTIFICATIONS DE NOUVEAU MESSAGE
-- =====================================================
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, type, data)
  SELECT 
    cp.user_id,
    'new_message',
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'preview', substring(NEW.content from 1 for 100)
    )
  FROM conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id
  AND cp.user_id != NEW.sender_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_message ON messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();


-- =====================================================
-- 7. INDEX POUR LES PERFORMANCES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_coordinates ON listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_payments_listing_id ON payments(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read) WHERE read = false;


-- =====================================================
-- 8. FONCTION POUR INCRÉMENTER LES VUES
-- =====================================================
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings 
  SET views = views + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 9. RLS POLICIES POUR CONVERSATIONS ET MESSAGES
-- =====================================================

-- Conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id 
      AND user_id = auth.uid()
    )
  );

-- Conversation participants (lecture)
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
  );

-- Conversation participants (insertion)
DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;
CREATE POLICY "Users can add conversation participants" ON conversation_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Messages (lecture)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
  );

-- Messages (envoi)
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 10. CORRECTION TABLE admins (email, full_name, role)
-- =====================================================
ALTER TABLE admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_role_check;
ALTER TABLE admins ADD CONSTRAINT admins_role_check
  CHECK (role IN ('admin', 'super_admin', 'moderator'));

-- =====================================================
-- 11. RLS POLICIES POUR admins (INSERT et UPDATE)
-- =====================================================
DROP POLICY IF EXISTS "Admins can signup" ON admins;
CREATE POLICY "Admins can signup"
    ON admins FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin can update admins" ON admins;
CREATE POLICY "Super admin can update admins"
    ON admins FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );


-- =====================================================
-- 12. CRÉATION DU PREMIER SUPER ADMIN
-- =====================================================
-- ATTENTION: Remplacez 'UUID_DU_USER' par l'ID de l'utilisateur
-- que vous venez de créer dans Auth > Users sur Supabase
--
-- 1. Allez dans Authentication > Users
-- 2. Créez un utilisateur manuellement (ou récupérez son UUID)
-- 3. Exécutez la requête ci-dessous avec le bon UUID
--
-- INSERT INTO admins (user_id, email, full_name, role, is_active)
-- VALUES ('UUID_DU_USER', 'email@example.com', 'Super Admin', 'super_admin', true);

-- =====================================================
-- 13. DÉSACTIVER LA CONFIRMATION EMAIL
-- =====================================================
-- Dans Supabase Dashboard > Authentication > Settings > CONFIRM EMAIL = OFF
-- OU exécuter :
-- UPDATE auth.config SET enable_confirmations = false;
-- (cette requête varie selon la version de Supabase)

-- =====================================================
-- FIN
-- =====================================================
