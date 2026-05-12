# 🚀 GUIDE DE DÉPLOIEMENT - Admin System en Ligne

## ⚡ ÉTAPE 1: Setup Database Supabase (OBLIGATOIRE)

### 1.1 Accédez à Supabase
```
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet DYO
3. Cliquez sur "SQL Editor"
4. Cliquez sur "New Query"
```

### 1.2 Exécutez le Script de Setup
**COPIER-COLLER COMPLÈTEMENT LE FICHIER: `admin_setup.sql`**

[Chemin du fichier: `./admin_setup.sql`]

```bash
# Assurez-vous que le fichier entier est copié et exécuté
# Le fichier crée automatiquement:
# ✓ Table admins
# ✓ Table reports  
# ✓ Table user_bans
# ✓ Table audit_logs
# ✓ RLS Policies
# ✓ Storage bucket
```

**Vérification**: Vérifiez que la requête s'exécute sans erreur

---

## 👤 ÉTAPE 2: Créer l'Admin de Production

Dans la même console Supabase SQL Editor, créez une **NOUVELLE REQUÊTE** et exécutez:

```sql
-- 1. Créer l'utilisateur admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  gen_random_uuid(),
  'admin@dyo-benin.com',
  crypt('SecureAdmin@2024!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Créer le profil admin dans la table admins
INSERT INTO admins (
  user_id,
  email,
  full_name,
  role,
  permissions,
  is_active
)
SELECT 
  id,
  email,
  'DYO Admin',
  'super_admin',
  ARRAY['view_reports', 'manage_listings', 'manage_users', 'view_users', 'ban_users'],
  true
FROM auth.users
WHERE email = 'admin@dyo-benin.com'
  AND NOT EXISTS (
    SELECT 1 FROM admins WHERE email = 'admin@dyo-benin.com'
  );

-- 3. Vérifier que l'admin a été créé
SELECT id, email, full_name, role, is_active FROM admins WHERE email = 'admin@dyo-benin.com';
```

**Résultat attendu**: Une ligne avec l'admin créé

---

## 📋 VOS IDENTIFIANTS ADMIN

### Admin de Production
```
URL de Connexion: https://votre-domaine.com/admin/auth/login
(ou pour test: http://localhost:3000/admin/auth/login)

Email:     admin@dyo-benin.com
Password:  SecureAdmin@2024!

Rôle:      Super Admin
Statut:    Actif ✓
```

### Admin de Test (Optionnel - pour développement seulement)
Si vous voulez un deuxième compte pour tester:

```sql
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  gen_random_uuid(),
  'moderator@dyo-benin.com',
  crypt('Moderator@2024!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO admins (user_id, email, full_name, role, permissions, is_active)
SELECT 
  id,
  email,
  'DYO Moderator',
  'moderator',
  ARRAY['view_reports', 'manage_listings'],
  true
FROM auth.users
WHERE email = 'moderator@dyo-benin.com'
  AND NOT EXISTS (SELECT 1 FROM admins WHERE email = 'moderator@dyo-benin.com');
```

**Identifiants Modérateur:**
```
Email:     moderator@dyo-benin.com
Password:  Moderator@2024!
Rôle:      Modérateur (permissions limitées)
```

---

## 🌐 ÉTAPE 3: Déployer sur Vercel

### 3.1 Préparer Vercel
```bash
# 1. Assurez-vous que tout est commité dans Git
git add .
git commit -m "Add admin system"

# 2. Poussez vers votre repo GitHub/GitLab
git push origin main
```

### 3.2 Déployer
**Option A: Via Vercel Dashboard**
```
1. Allez sur https://vercel.com
2. Importez votre repo
3. Assurez-vous que les variables d'environnement sont configurées:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (optionnel)
4. Cliquez "Deploy"
```

**Option B: Via CLI**
```bash
npm install -g vercel
vercel
```

---

## ✅ VÉRIFICATIONS POST-DÉPLOIEMENT

### 1. Vérifier la connexion admin
```
1. Allez sur https://votre-domaine.com/admin/auth/login
2. Connectez-vous avec:
   - Email: admin@dyo-benin.com
   - Password: SecureAdmin@2024!
3. Vous devriez voir le dashboard
```

### 2. Vérifier les pages admin
- [ ] Dashboard: `/admin/dashboard` → Stats visibles
- [ ] Annonces: `/admin/dashboard/listings` → Liste des annonces
- [ ] Signalements: `/admin/dashboard/reports` → Gestion des reports
- [ ] Comptes: `/admin/dashboard/users` → Gestion des users
- [ ] Paramètres: `/admin/dashboard/settings` → Profil admin

### 3. Vérifier la sécurité
```bash
# Test 1: Accès non-authentifié au dashboard
# Résultat attendu: Redirection vers login ✓

# Test 2: Accès avec compte utilisateur normal
# Résultat attendu: Redirection vers login ✓

# Test 3: Connexion avec admin
# Résultat attendu: Accès au dashboard ✓
```

---

## 🔒 Sécurité - À Faire

### OBLIGATOIRE
- [ ] **Changer les mots de passe** (les vôtres propres!)
- [ ] **Configurer SUPABASE_SERVICE_ROLE_KEY** en production
- [ ] **Activer SSL/TLS** sur Vercel (automatique)
- [ ] **Vérifier les RLS policies** dans Supabase
- [ ] **Sauvegarder vos identifiants** en lieu sûr

### RECOMMANDÉ
- [ ] Configurer les notifications email
- [ ] Activer les logs d'audit
- [ ] Mettre en place un 2FA (future enhancement)
- [ ] Configurer les backups Supabase

---

## 🆘 Troubleshooting

### "Accès refusé - Vous n'êtes pas administrateur"
```
→ Vérifiez que l'admin a été créé dans la table admins
→ Vérifiez que is_active = true
→ Rafraîchissez la page
```

### Les données ne s'affichent pas
```
→ Vérifiez les RLS policies dans Supabase
→ Vérifiez que vous êtes connecté en admin
→ Vérifiez la console (F12) pour les erreurs
```

### Erreur de connexion
```
→ Vérifiez les clés Supabase dans les variables d'environnement
→ Vérifiez que le projet Supabase est actif
→ Vérifiez la base de données existe
```

---

## 📞 Support Rapide

### Documents de référence
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Documentation complète
- [ADMIN_TEST_CHECKLIST.md](./ADMIN_TEST_CHECKLIST.md) - Checklist
- [QUICK_START_ADMIN.md](./QUICK_START_ADMIN.md) - Quick start
- [TEST_REPORT.md](./TEST_REPORT.md) - Rapport de test

### Fichiers SQL
- `admin_setup.sql` - Setup complet
- `admin_quick_setup.sql` - Setup rapide (test)

---

## 🎯 Résumé des Étapes

| # | Étape | Statut |
|----|-------|--------|
| 1 | Exécuter `admin_setup.sql` | ⏳ À faire |
| 2 | Créer l'admin | ⏳ À faire |
| 3 | Déployer sur Vercel | ⏳ À faire |
| 4 | Vérifier en ligne | ⏳ À faire |
| 5 | Sécuriser (passwords) | ⏳ À faire |

---

## ⚡ Quick Copy-Paste

### Les deux scripts SQL à exécuter dans Supabase:

**Script 1**: Tout le contenu de `admin_setup.sql`  
**Script 2**: 
```sql
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, last_sign_in_at, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change) VALUES (gen_random_uuid(), 'admin@dyo-benin.com', crypt('SecureAdmin@2024!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), now(), 'authenticated', 'authenticated', '', '', '', '') ON CONFLICT (email) DO NOTHING;

INSERT INTO admins (user_id, email, full_name, role, permissions, is_active) SELECT id, email, 'DYO Admin', 'super_admin', ARRAY['view_reports', 'manage_listings', 'manage_users', 'view_users', 'ban_users'], true FROM auth.users WHERE email = 'admin@dyo-benin.com' AND NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@dyo-benin.com');

SELECT id, email, full_name, role, is_active FROM admins WHERE email = 'admin@dyo-benin.com';
```

---

**Vous êtes prêt! 🚀**
