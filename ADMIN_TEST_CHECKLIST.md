# 🧪 Checklist de Test - Système Admin

## ✅ Préparation

- [ ] Cloner/Ouvrir le projet
- [ ] Vérifier que `.env.local` contient les clés Supabase valides
- [ ] Avoir accès à la console Supabase de votre projet

## 🗄️ Setup Base de Données

### Phase 1: Exécuter le Setup SQL
- [ ] Aller sur https://app.supabase.com
- [ ] Ouvrir la console Supabase du projet
- [ ] Aller dans "SQL Editor"
- [ ] Créer une nouvelle requête
- [ ] Copier le contenu du fichier `admin_setup.sql`
- [ ] Exécuter la requête
- [ ] Vérifier qu'aucune erreur n'apparaît
- [ ] Vérifier que les tables ont été créées:
  ```sql
  SELECT * FROM admins;
  SELECT * FROM reports;
  SELECT * FROM user_bans;
  SELECT * FROM audit_logs;
  ```

### Phase 2: Créer Admin de Test
- [ ] Créer une nouvelle requête SQL
- [ ] Copier le contenu du fichier `admin_quick_setup.sql`
- [ ] Exécuter la requête
- [ ] Vérifier que l'admin a été créé:
  ```sql
  SELECT * FROM admins WHERE email = 'admin@dyo.local';
  ```

## 🚀 Lancer l'Application

```bash
# Terminal 1: Démarrer le dev server
npm install  # Si pas déjà fait
npm run dev

# L'app devrait être disponible à http://localhost:3000
```

## 🔐 Tester la Connexion Admin

### Test 1: Page Login Admin
- [ ] Allez à `http://localhost:3000/admin/auth/login`
- [ ] Vérifiez que la page se charge correctement
- [ ] Vérifiez le logo et le design

### Test 2: Tentative Sans Identifiants
- [ ] Cliquez sur "Se connecter" sans remplir les champs
- [ ] Vérifiez que les validations apparaissent

### Test 3: Identifiants Invalides
- [ ] Email: `invalid@test.com`
- [ ] Password: `wrong123`
- [ ] Vérifiez le message d'erreur "Email ou mot de passe incorrect"

### Test 4: Identifiants Valides
- [ ] Email: `admin@dyo.local`
- [ ] Password: `Admin@123456`
- [ ] Cliquez "Se connecter"
- [ ] Vérifiez la redirection vers `/admin/dashboard`

## 📊 Tester le Dashboard Principal

### Test 5: Page Dashboard
- [ ] Vérifiez que la page charge correctement
- [ ] Vérifiez le titre "Dashboard"
- [ ] Vérifiez que le sidebar s'affiche
- [ ] Vérifiez que les stats s'affichent (même s'ils sont à 0)

### Test 6: Sidebar Navigation
- [ ] Cliquez sur "Annonces" → Doit aller à `/admin/dashboard/listings`
- [ ] Cliquez sur "Signalements" → Doit aller à `/admin/dashboard/reports`
- [ ] Cliquez sur "Comptes" → Doit aller à `/admin/dashboard/users`
- [ ] Cliquez sur "Paramètres" → Doit aller à `/admin/dashboard/settings`
- [ ] Cliquez sur "Dashboard" → Doit revenir à `/admin/dashboard`

### Test 7: Responsive Design
- [ ] Ouvrez DevTools (F12)
- [ ] Mode Mobile (iPhone X)
- [ ] Cliquez sur le menu hamburger
- [ ] Vérifiez que le sidebar s'ouvre
- [ ] Cliquez sur un lien
- [ ] Vérifiez que le sidebar se ferme

## 📋 Tester Gestion des Annonces

### Test 8: Page Listings
- [ ] Allez à `/admin/dashboard/listings`
- [ ] Vérifiez le titre "Gestion des Annonces"
- [ ] Vérifiez le tableau (vide si pas d'annonces)

### Test 9: Créer des Annonces de Test
D'abord, créez des annonces comme utilisateur normal:
- [ ] Connectez-vous à `/auth/login` avec un utilisateur normal
- [ ] Allez au dashboard normal `/dashboard`
- [ ] Créez 2-3 annonces
- [ ] Retournez au admin dashboard

### Test 10: Voir les Annonces en Admin
- [ ] Allez à `/admin/dashboard/listings`
- [ ] Vérifiez que les annonces créées apparaissent
- [ ] Vérifiez que le statut est "pending_payment"

### Test 11: Approuver une Annonce
- [ ] Cliquez sur le bouton ✓ (approuver)
- [ ] Vérifiez que le statut change en "active"
- [ ] Attendez quelques secondes
- [ ] Rafraîchissez la page
- [ ] Vérifiez que le changement persiste

### Test 12: Archiver une Annonce
- [ ] Cliquez sur le bouton X (archiver)
- [ ] Vérifiez que le statut change en "archived"

### Test 13: Supprimer une Annonce
- [ ] Cliquez sur le bouton 🗑️ (supprimer)
- [ ] Vérifiez le dialog de confirmation
- [ ] Cliquez "Supprimer"
- [ ] Vérifiez que l'annonce disparaît

## 📢 Tester Gestion des Signalements

### Test 14: Créer un Signalement
D'abord, créez un signalement comme utilisateur normal:
- [ ] Connectez-vous comme utilisateur normal
- [ ] Visitez une annonce
- [ ] Cliquez sur "Signaler"
- [ ] Remplissez le formulaire
- [ ] Submitez

### Test 15: Voir les Signalements en Admin
- [ ] Allez à `/admin/dashboard/reports`
- [ ] Vérifiez que le signalement apparaît
- [ ] Vérifiez que le statut est "open"

### Test 16: Gérer un Signalement
- [ ] Cliquez sur le chevron pour expander
- [ ] Vérifiez que les détails apparaissent
- [ ] Ajoutez une note: "Vérifié - Contenu OK"
- [ ] Changez le statut à "in_review"
- [ ] Vérifiez la mise à jour
- [ ] Cliquez "Résoudre"
- [ ] Vérifiez que le statut passe à "resolved"

### Test 17: Rejeter un Signalement
- [ ] Créez un nouveau signalement
- [ ] Expandez-le
- [ ] Cliquez "Rejeter"
- [ ] Vérifiez que le statut passe à "dismissed"

## 👥 Tester Gestion des Comptes

### Test 18: Page Users
- [ ] Allez à `/admin/dashboard/users`
- [ ] Vérifiez que les utilisateurs apparaissent
- [ ] Vérifiez les colonnes (nom, email, ville, note, échanges)

### Test 19: Bannir un Utilisateur
- [ ] Sélectionnez un utilisateur (pas votre compte admin!)
- [ ] Cliquez sur le bouton ⛔ (bannir)
- [ ] Entrez une raison: "Comportement inapproprié"
- [ ] Cliquez "Bannir"
- [ ] Vérifiez que le statut change en "Banni"

### Test 20: Débannir un Utilisateur
- [ ] Pour l'utilisateur banni, le bouton devrait être ✓
- [ ] Cliquez sur ✓
- [ ] Vérifiez que le statut revient à "Actif"

## ⚙️ Tester Paramètres

### Test 21: Page Settings
- [ ] Allez à `/admin/dashboard/settings`
- [ ] Vérifiez que vos infos admin s'affichent
- [ ] Vérifiez le rôle: "Super Administrateur"
- [ ] Vérifiez le statut: "Actif"

## 🔐 Tester Sécurité

### Test 22: Protection des Routes
- [ ] Déconnectez-vous (cliquez "Déconnexion")
- [ ] Essayez d'aller directement à `/admin/dashboard`
- [ ] Vérifiez que vous êtes redirigé à `/admin/auth/login`

### Test 23: Non-Admin Access
- [ ] Connectez-vous comme utilisateur normal
- [ ] Essayez d'aller à `http://localhost:3000/admin/dashboard`
- [ ] Vérifiez que vous êtes redirigé à `/admin/auth/login`
- [ ] Vérifiez qu'une erreur d'accès apparaît

## 🧪 Tests Avancés (Optionnels)

### Test 24: Vérifier RLS en BD
```sql
-- Vérifier que l'utilisateur normal ne voit pas les admin data
SELECT * FROM admins;  -- Devrait être vide pour un utilisateur normal

-- Vérifier que les reports ont les bonnes permissions
SELECT * FROM reports;
```

### Test 25: Vérifier les Logs Audit
```sql
-- Devrait avoir des entrées après les actions
SELECT * FROM audit_logs;
```

### Test 26: Performance
- [ ] Naviguez entre les pages
- [ ] Vérifiez que tout est rapide
- [ ] Vérifiez qu'il n'y a pas de lag

## 📝 Résultats

| Nom du Test | Statut | Notes |
|------------|--------|-------|
| Test 1: Page Login Admin | ✅/❌ | |
| Test 2: Validation | ✅/❌ | |
| Test 3: Erreur Identifiants | ✅/❌ | |
| Test 4: Connexion Admin | ✅/❌ | |
| Test 5: Dashboard | ✅/❌ | |
| Test 6: Navigation | ✅/❌ | |
| Test 7: Responsive | ✅/❌ | |
| Test 8-10: Annonces | ✅/❌ | |
| Test 11-13: Actions Annonces | ✅/❌ | |
| Test 14-17: Signalements | ✅/❌ | |
| Test 18-20: Comptes | ✅/❌ | |
| Test 21: Settings | ✅/❌ | |
| Test 22-23: Sécurité | ✅/❌ | |

## 🚀 Prochaines Étapes Si OK

- [ ] Déployer en production
- [ ] Créer les comptes admin de production
- [ ] Notifier l'équipe
- [ ] Configurer les notifications (optionnel)
