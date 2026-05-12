# ⚡ Quick Start - Admin Panel

## 🎯 Objectif
Tester le système admin en local rapidement (5 minutes)

## 📋 Pré-requis
- Node.js 18+ installé
- Accès à Supabase du projet
- Projet cloné/ouvert

## ⏱️ 5 Étapes Rapides

### 1️⃣ Setup BD (1 min)
```bash
# Allez sur https://app.supabase.com → Votre Projet → SQL Editor
# Copier-coller le fichier: admin_setup.sql
# Exécuter
```

### 2️⃣ Créer Admin Test (1 min)
```bash
# Même endroit SQL Editor
# Copier-coller: admin_quick_setup.sql
# Exécuter
```

### 3️⃣ Démarrer App (2 min)
```bash
npm install
npm run dev
```

### 4️⃣ Vous Connecter (30 sec)
```
URL: http://localhost:3000/admin/auth/login
Email: admin@dyo.local
Password: Admin@123456
```

### 5️⃣ Tester (30 sec)
```
Dashboard: http://localhost:3000/admin/dashboard
Annonces: http://localhost:3000/admin/dashboard/listings
Signalements: http://localhost:3000/admin/dashboard/reports
Comptes: http://localhost:3000/admin/dashboard/users
```

## ✅ Tout Fonctionne Si

- ✓ Connexion réussie
- ✓ Dashboard affiche les stats
- ✓ Navigation entre les pages fonctionne
- ✓ Pas de console errors

## 📁 Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `admin_setup.sql` | 📂 Crée les tables et RLS |
| `admin_quick_setup.sql` | ⚙️ Crée un admin de test |
| `ADMIN_SETUP.md` | 📖 Documentation complète |
| `ADMIN_SETUP_SUMMARY.md` | 📋 Résumé du système |
| `ADMIN_TEST_CHECKLIST.md` | ✅ Checklist de test |

## 🆘 Problèmes Courants

### "Accès refusé"
→ Vérifiez que `admin_quick_setup.sql` a été exécuté

### Les données ne s'affichent pas
→ Rafraîchissez la page (F5)

### Erreur de connexion
→ Vérifiez `.env.local` avec clés Supabase valides

### Page blanche
→ Ouvrez DevTools (F12) et cherchez les erreurs

## 🎓 Comprendre le Système

### 4 Pages Admin
1. **Dashboard** → Stats du site
2. **Annonces** → Approuver/Supprimer les annonces
3. **Signalements** → Gérer les signalements
4. **Comptes** → Bannir les utilisateurs

### 4 Tables BD
1. `admins` → Les administrateurs
2. `reports` → Les signalements
3. `user_bans` → Les bannissements
4. `audit_logs` → L'historique

### Sécurité
- ✅ Vérification admin à chaque page
- ✅ RLS sur toutes les tables
- ✅ Logout automatique si non autorisé

## 📞 Support Docs

- 📖 [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Guide d'installation
- 📋 [ADMIN_SETUP_SUMMARY.md](./ADMIN_SETUP_SUMMARY.md) - Résumé du système
- ✅ [ADMIN_TEST_CHECKLIST.md](./ADMIN_TEST_CHECKLIST.md) - Checklist complète

---

**Bon test! 🚀**
