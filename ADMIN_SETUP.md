# Guide d'Installation et de Test du Système Admin

## ✅ Étapes d'Installation

### 1. Exécuter le SQL Setup dans Supabase

1. Connectez-vous à votre console Supabase
2. Allez dans `SQL Editor`
3. Créez une nouvelle requête
4. Copiez et exécutez le contenu du fichier `admin_setup.sql`

Cela va créer:
- Table `admins` (pour les administrateurs)
- Table `reports` (pour les signalements)
- Table `audit_logs` (pour l'audit)
- Table `user_bans` (pour les bannissements)
- Politiques RLS appropriées

### 2. Créer un Utilisateur Admin de Test

Exécutez ce script SQL dans Supabase SQL Editor:

```sql
-- 1. D'abord, créer l'utilisateur avec l'auth
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  crypt('admin123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- 2. Récupérer l'ID de l'utilisateur
SELECT id FROM auth.users WHERE email = 'admin@test.com';

-- 3. Créer le profil admin (remplacez UUID par l'ID récupéré ci-dessus)
INSERT INTO admins (
  user_id,
  email,
  full_name,
  role,
  is_active
)
VALUES (
  'UUID_DE_L_UTILISATEUR_ICI',  -- Remplacez par l'UUID récupéré
  'admin@test.com',
  'Admin Test',
  'super_admin',
  true
) ON CONFLICT (user_id) DO NOTHING;
```

### 3. Démarrer l'Application en Local

```bash
npm install
npm run dev
```

L'app est disponible à `http://localhost:3000`

## 🔐 Accès Admin

### Page de Connexion Admin
- **URL**: `http://localhost:3000/admin/auth/login`
- **Email**: `admin@test.com`
- **Mot de passe**: `admin123456`

### Dashboard Admin
- **URL**: `http://localhost:3000/admin/dashboard`

## 🎯 Fonctionnalités du Dashboard Admin

### 1. Dashboard Principal (`/admin/dashboard`)
Affiche les statistiques du site:
- ✓ Nombre total d'utilisateurs
- ✓ Nombre total d'annonces
- ✓ Nombre d'annonces actives
- ✓ Nombre de signalements
- ✓ Signalements en attente
- ✓ Nombre total d'échanges

### 2. Gestion des Annonces (`/admin/dashboard/listings`)
- 📋 Liste toutes les annonces
- ✅ Approuver les annonces (pending_payment → active)
- ❌ Archiver les annonces
- 🗑️ Supprimer les annonces
- 👤 Voir l'info de l'utilisateur qui a posté

Statuts disponibles:
- `pending_payment` - En attente de paiement
- `active` - Annonce active
- `archived` - Annoncée archivée
- `completed` - Échange terminé

### 3. Gestion des Signalements (`/admin/dashboard/reports`)
- 📢 Liste tous les signalements
- 🔍 Voir les détails des signalements
- 📝 Ajouter des notes d'administration
- ✅ Marquer comme résolu
- ❌ Rejeter un signalement
- 🔄 Changer le statut (ouvert → en révision → résolu/rejeté)

Types de signalements:
- `inappropriate_content` - Contenu inapproprié
- `fraud` - Fraude
- `harassment` - Harcèlement
- `fake_item` - Objet faux
- `other` - Autre

### 4. Gestion des Comptes (`/admin/dashboard/users`)
- 👥 Liste tous les utilisateurs
- ⭐ Voir la note moyenne
- 📊 Voir le nombre d'échanges
- ⛔ Bannir les utilisateurs avec raison
- ✅ Débannir les utilisateurs

### 5. Paramètres (`/admin/dashboard/settings`)
- 👤 Voir le profil admin
- 🔐 Voir le rôle et les permissions

## 🧪 Test Rapide - Créer des Données de Test

### Ajouter un utilisateur normal
1. Allez à `/auth/sign-up`
2. Créez un compte avec les infos de test

### Créer une annonce
1. Connectez-vous
2. Allez au dashboard `/dashboard`
3. Cliquez sur "Publier une annonce"

### Créer un signalement
1. Connectez-vous en tant qu'utilisateur normal
2. Visitez une annonce
3. Cliquez sur "Signaler"

## 🔍 Vérifier les Données dans Supabase

```sql
-- Voir les admins
SELECT * FROM admins;

-- Voir les signalements
SELECT * FROM reports;

-- Voir les bannissements
SELECT * FROM user_bans;

-- Voir l'historique d'audit
SELECT * FROM audit_logs;
```

## ⚙️ Configuration de l'Environnement

Assurez-vous que votre `.env.local` contient:

```
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

## 🚀 Déployer en Production

Avant de déployer:
1. Exécutez le script `admin_setup.sql` en production
2. Créez les comptes admin de production
3. Testez complètement en local
4. Déployez sur Vercel

## ❓ Dépannage

### "Accès refusé - Vous n'êtes pas administrateur"
- Vérifiez que l'utilisateur existe dans la table `admins`
- Vérifiez que `is_active = true`

### Les données ne s'affichent pas
- Vérifiez les politiques RLS
- Vérifiez que vous êtes connecté en tant qu'admin
- Vérifiez la console de Supabase pour les erreurs

### Les modifications ne sont pas sauvegardées
- Vérifiez les permissions RLS
- Vérifiez que l'admin a le rôle approprié

## 📞 Support

Pour plus d'aide, consultez:
- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Radix UI](https://www.radix-ui.com/)
