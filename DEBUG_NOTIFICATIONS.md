# 🔍 Diagnostic des Notifications

## Pour Déboguer le Problème

Exécute ces commandes dans **Supabase SQL Editor**:

### 1. Vérifier la Structure de la Table
```sql
-- Voir la structure de la table notifications
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
```

### 2. Vérifier les RLS Policies
```sql
-- Voir toutes les RLS policies pour notifications
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'notifications';
```

### 3. Insérer une Notification de Test (avec Service Role Key dans le client)
```sql
-- Teste l'insertion directement (en tant qu'admin)
INSERT INTO notifications (
  recipient_id,
  actor_id,
  type,
  data
) VALUES (
  'uuid-du-recipient',  -- Remplace par un UUID valide de profiles
  'uuid-de-l-acteur',   -- Remplace par un UUID valide de profiles
  'exchange_proposed',
  '{
    "listing_id": "test",
    "listing_title": "Test"
  }'::jsonb
)
RETURNING *;
```

### 4. Vérifier les Notifications Insérées
```sql
-- Voir toutes les notifications
SELECT id, recipient_id, actor_id, type, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

### 5. Voir les Erreurs RLS (si quelqu'une)
```sql
-- Les notifications ne visibles que par le recipient (RLS)
-- Essaie d'une session utilisateur normal
SELECT * FROM notifications WHERE recipient_id = auth.uid();
```

---

## Les Vrais UUIDs pour Tester

Récupère les UUIDs réels de tes users:

```sql
-- Voir tous les UUIDs des utilisateurs
SELECT id, email, raw_user_meta_data 
FROM auth.users 
LIMIT 10;

-- Voir les IDs dans profiles
SELECT id, email, full_name 
FROM profiles 
LIMIT 10;
```

---

## Problème Probable

Le problème est probablement **l'une de ces raisons**:

1. ❌ **RLS Policy trop restrictive** - La policy exige `actor_id = auth.uid()` mais peut-être que l'UUID ne correspond pas
2. ❌ **Erreur de Foreign Key** - recipient_id ou actor_id n'existe pas dans profiles
3. ❌ **Bug dans le code client** - Le currentUserId n'est pas le bon UUID
4. ❌ **Erreur de Realtime** - La notification est créée mais le websocket ne s'active pas

---

## Solutions Rapides

### Option 1: Modifier la RLS Policy pour Permettre l'Insertion
```sql
-- Remplace la policy existante par une plus permissive
DROP POLICY "Authenticated can insert notifications" ON notifications;

CREATE POLICY "Authenticated can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
```

### Option 2: Utiliser une Fonction Supabase pour Créer les Notifications
Au lieu de créer directement, appelle une fonction serveur qui crée la notification avec SERVICE ROLE.

### Option 3: Désactiver RLS Temporairement pour Tester
```sql
-- ⚠️ DANGER - Juste pour tester
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Teste l'insertion
-- ...

-- Puis réactive
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

