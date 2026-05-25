# 🚨 RAPPORT COMPLET - DIVERGENCES SQL

## ⚠️ PROBLÈME PRINCIPAL

Tu as **3 versions différentes** des tables qui ne sont PAS synchronisées:

1. **supabase_schema.sql** - VERSION PRINCIPALE ✅
2. **scripts/001_create_tables.sql** - VERSION ALTERNATIVE (OLD)
3. **DIAGNOSTIC_COMPLETE.sql** - VERSION DE DEBUG (OLD)

---

## 📊 DIVERGENCES PAR TABLE

### 🔴 TABLE NOTIFICATIONS (MAJEUR - MANQUE TOUTES LES COLONNES)

| Aspect | schema.sql ✅ | create_notifications.sql ❌ |
|--------|------|------|
| recipient_id | profiles(id) | auth.users(id) |
| actor_id | profiles(id) | auth.users(id) |
| Colonne | read_at | read (BOOLEAN) |
| Structure | Minimaliste | Avec updated_at |

**➜ SOLUTION**: Exécuter `MIGRATE_NOTIFICATIONS_TABLE.sql`

---

### 🟠 TABLE CATEGORIES (MINEUR)

| Fichier | Catégories | Notes |
|---------|-----------|-------|
| `supabase_schema.sql` | 5 catégories | Correctes (annales, manuels, etc.) |
| `scripts/001_create_tables.sql` | 6 catégories | Anciennes (book, exam, material, etc.) |
| `DIAGNOSTIC_COMPLETE.sql` | 6 catégories | Anciennes aussi (books, notes, lab-equipment) |

**Lesquelles utiliser:** Les 5 du `supabase_schema.sql` (plus à jour)

```sql
-- BONNES (supabase_schema.sql)
('annales-sujets', 'Annales et sujets d''examens', 'file-text', '#f59e0b')
('manuels-scolaires', 'Manuels scolaires', 'graduation-cap', '#8b5cf6')
('materiels-outils', 'Matériels et outils', 'package', '#3b82f6')
('fournitures-scolaires', 'Fournitures scolaires', 'notebook-pen', '#10b981')
('autres-documents', 'Autres Documents Académiques', 'book-open', '#ec4899')
```

---

### 🟡 TABLE LISTINGS (MINEUR)

| Propriété | supabase_schema.sql | scripts/001_create_tables.sql | Impact |
|-----------|-------------------|----------------------------|--------|
| `status` VALUES | 'pending_payment', 'active', 'reserved', 'completed', 'archived' | 'active', 'exchanged', 'archived' | ⚠️ Incompatible |
| `is_paid` | ❌ Non existant | ✅ BOOLEAN DEFAULT FALSE | ❌ Code n'utilise pas |
| `cover_url` | ❌ Non existant | ✅ TEXT | ❌ Non utilisé |
| `latitude/longitude` | ❌ Non existant | ✅ DOUBLE PRECISION | ⚠️ Non utilisé |
| `category_id` | ✅ UUID REFERENCES | ✅ UUID NOT NULL | ✅ OK |

**➜ À UTILISER:** `supabase_schema.sql` (version actuelle utilisée par le code)

---

### 🟢 TABLE PROFILES (BON)

✅ Toutes les versions sont similaires

```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
full_name TEXT
email TEXT
university TEXT
city TEXT
avatar_url TEXT
average_rating DECIMAL(3,2) DEFAULT 0.0
total_exchanges INTEGER DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

### 🟢 TABLE LISTINGS STATUS

| Status | Utilisé dans | Notes |
|--------|-------------|-------|
| `pending_payment` | Code (ancien) | ❌ Désactivé dans code |
| `active` | Code + UI | ✅ Utilis maintenant |
| `reserved` | - | ℹ️ Rare |
| `completed` | - | ℹ️ Rare |
| `archived` | - | ℹ️ Rare |

**Code actuellement:**
```typescript
// publish-form.tsx
status: 'active' // ✅ Immédiatement actif (pas pending_payment)
```

---

## ✅ RECOMMANDATIONS

### 1️⃣ FICHIER À UTILISER (SOURCE OF TRUTH)

**➜ `supabase_schema.sql` est ta source principale** ✅

**À IGNORER:**
- ❌ `scripts/001_create_tables.sql` (obsolète)
- ❌ `DIAGNOSTIC_COMPLETE.sql` (debug seulement)
- ❌ `create_notifications_table.sql` (structure mauvaise)

### 2️⃣ MIGRATION REQUISE

**À exécuter DANS Supabase (dans cet ordre):**

```
1️⃣ MIGRATE_NOTIFICATIONS_TABLE.sql    (obligatoire!)
2️⃣ FIX_NOTIFICATIONS_RLS.sql           (obligatoire!)
```

### 3️⃣ VÉRIFIER LES TABLES EXISTANTES

```sql
-- Dans Supabase, exécute ceci pour voir ce que tu as
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Tu devrais voir:
- ✅ profiles
- ✅ categories  
- ✅ listings
- ✅ notifications
- ✅ conversations
- ✅ messages
- ✅ exchanges
- ✅ favorites
- ✅ payments (optionnel)

---

## 🔍 SI TU AS DES DOUTES

### Pour Voir l'État Réel de ta BD

Exécute dans Supabase SQL Editor:

```sql
-- 1. Voir la structure de notifications
\d notifications

-- 2. Voir toutes les colonnes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- 3. Vérifier les RLS policies
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'notifications';

-- 4. Compter les données
SELECT COUNT(*) FROM notifications;
```

---

## 🚀 PROCHAINES ÉTAPES

```
1. Exécuter MIGRATE_NOTIFICATIONS_TABLE.sql dans Supabase
2. Exécuter FIX_NOTIFICATIONS_RLS.sql dans Supabase
3. Vérifier avec les requêtes ci-dessus
4. Tester: Proposer un échange → Check badge notifications
5. SUPPRIMER les anciens fichiers SQL (mettre à jour .gitignore)
```

---

## 📝 FICHIERS À GARDER / SUPPRIMER

| Fichier SQL | Action | Raison |
|-------------|--------|--------|
| `supabase_schema.sql` | ✅ GARDER | Source principale |
| `scripts/001_create_tables.sql` | ❌ SUPPRIMER | Obsolète, structure old |
| `DIAGNOSTIC_COMPLETE.sql` | ❌ SUPPRIMER | Seulement pour debug |
| `create_notifications_table.sql` | ❌ SUPPRIMER | Structure mauvaise |
| `admin_setup.sql` | ✅ GARDER | Admin tables |
| `MIGRATE_NOTIFICATIONS_TABLE.sql` | ✅ GARDER | Migration active |
| `FIX_NOTIFICATIONS_RLS.sql` | ✅ GARDER | Correction RLS |

---

**Status**: 📋 **AUDIT COMPLET**  
**Action Requise**: 🔴 **EXÉCUTER LES MIGRATIONS**  
**Priorité**: 🟥 **HAUTE**
