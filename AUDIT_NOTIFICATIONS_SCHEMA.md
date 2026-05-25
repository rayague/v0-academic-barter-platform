# 🔍 AUDIT COMPLET - TABLES ET SCHÉMAS

## ⚠️ PROBLÈMES TROUVÉS

### 1️⃣ TABLE NOTIFICATIONS - INCOMPATIBILITÉ MAJEURE ❌

| Fichier | Colonne | Type | REFERENCES | Status |
|---------|---------|------|-----------|--------|
| `create_notifications_table.sql` | `recipient_id` | UUID | `auth.users(id)` | ❌ MAUVAIS |
| `create_notifications_table.sql` | `actor_id` | UUID | `auth.users(id)` | ❌ MAUVAIS |
| `create_notifications_table.sql` | `read` | BOOLEAN | - | ❌ MAUVAIS |
| **`supabase_schema.sql`** | **`recipient_id`** | **UUID** | **`profiles(id)`** | **✅ BON** |
| **`supabase_schema.sql`** | **`actor_id`** | **UUID** | **`profiles(id)`** | **✅ BON** |
| **`supabase_schema.sql`** | **`read_at`** | **TIMESTAMP** | - | **✅ BON** |

**Impact:** Le code utilise `read_at` et `profiles(id)` mais ta table utilise `read` et `auth.users(id)`

**Solution:** Exécuter le script `MIGRATE_NOTIFICATIONS_TABLE.sql` (créé pour toi)

---

## 📋 VÉRIFICATION COMPLÈTE DES FICHIERS SQL

### ✅ Fichiers à Utiliser

| Fichier | Statut | Contenu |
|---------|--------|---------|
| `supabase_schema.sql` | ✅ À JOUR | Schéma complet correct |
| `FIX_NOTIFICATIONS_RLS.sql` | ✅ À EXÉCUTER | Correction RLS policy |
| `MIGRATE_NOTIFICATIONS_TABLE.sql` | ✅ À EXÉCUTER | Nouvelle table notifications |

### ❌ Fichiers OBSOLÈTES

| Fichier | Raison |
|---------|--------|
| `create_notifications_table.sql` | Structure incorrecte (utilise auth.users au lieu de profiles) |
| `DIAGNOSTIC_COMPLETE.sql` | Ancien |
| `admin_setup.sql` | Spécifique aux admins |

---

## 📊 DIVERGENCES TROUVÉES

### Dans `supabase_schema.sql` vs `create_notifications_table.sql`

```diff
❌ create_notifications_table.sql (MAUVAIS)
recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
read BOOLEAN DEFAULT FALSE
updated_at TIMESTAMP WITH TIME ZONE

✅ supabase_schema.sql (BON)
recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL
read_at TIMESTAMP WITH TIME ZONE
-- NO updated_at
```

---

## 🛠️ CODE UTILISÉ vs STRUCTURE BD

### Dans `components/listings/exchange-proposal-dialog.tsx`:
```typescript
.insert({
  recipient_id: receiverId,        // ← UUID de profiles ✅
  actor_id: currentUserId,         // ← UUID de profiles ✅
  type: 'exchange_proposed',       // ✅
  data: { ... }                    // ✅
})
```

### Dans `components/notifications/notifications-list.tsx`:
```typescript
type NotificationRow = {
  read_at: string | null  // ← Utilise read_at, PAS read ✅
  ...
}
```

**CONCLUSION:** Le code est correct, c'est la TABLE qui est mauvaise!

---

## 🚨 AUTRES PROBLÈMES POTENTIELS

### 1. Divergence RLS Policy

| Fichier | Policy |
|---------|--------|
| `create_notifications_table.sql` | `WITH CHECK (auth.role() = 'authenticated');` |
| `supabase_schema.sql` (OLD) | `WITH CHECK (auth.role() = 'authenticated' AND (actor_id IS NULL OR actor_id = auth.uid()));` |
| `FIX_NOTIFICATIONS_RLS.sql` | `WITH CHECK (auth.role() = 'authenticated');` |

**Solution:** Le fichier `FIX_NOTIFICATIONS_RLS.sql` change la policy à la version permissive ✅

---

## ✅ ÉTAPES À SUIVRE (DANS L'ORDRE)

### Étape 1️⃣: Corriger la Table (OBLIGATOIRE!)
```
1. Ouvre Supabase SQL Editor
2. Crée NEW QUERY
3. Copie TOUT le contenu de: MIGRATE_NOTIFICATIONS_TABLE.sql
4. Clique RUN
5. Attends "Success"
```

### Étape 2️⃣: Corriger la RLS Policy (OBLIGATOIRE!)
```
1. Crée NEW QUERY
2. Copie TOUT le contenu de: FIX_NOTIFICATIONS_RLS.sql
3. Clique RUN
4. Attends "Success"
```

### Étape 3️⃣: Vérifier Tout Fonctionne
```sql
-- Teste dans Supabase
SELECT * FROM notifications LIMIT 5;
```

**Devrait marcher maintenant!** 🎉

---

## 📝 FICHIERS À GARDER / SUPPRIMER

| Fichier | Action | Raison |
|---------|--------|--------|
| `supabase_schema.sql` | ✅ GARDER | Schema principal correct |
| `create_notifications_table.sql` | ❌ SUPPRIMER | Obsolète, structure incorrecte |
| `FIX_NOTIFICATIONS_RLS.sql` | ✅ GARDER | Utilisé pour correction |
| `MIGRATE_NOTIFICATIONS_TABLE.sql` | ✅ GARDER | Migration table |

---

## 💡 SI ENCORE ÇA NE MARCHE PAS

Exécute ceci dans Supabase SQL Editor pour tester:

```sql
-- 1. Vérifier la structure
\d notifications

-- 2. Tester l'insertion
INSERT INTO notifications (
  recipient_id,
  actor_id,
  type,
  data
) VALUES (
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM profiles LIMIT 1),
  'exchange_proposed',
  '{}'::jsonb
) RETURNING *;

-- 3. Vérifier qu'elle est là
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
```

Si tu vois une ligne → **C'EST BON!** ✅

---

**Status**: ✅ **PRÊT À MIGRER**  
**Créé**: 25 Mai 2026
