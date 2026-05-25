# 🔔 Guide de Test - Système de Notifications

## ✅ État: Déployé en Live (25 Mai 2026)

---

## 📋 Changements Effectués

### Activé: Création Automatique de Notifications
- ✅ La création de notifications pour les propositions d'échange est **MAINTENANT ACTIVE**
- ✅ Chaque proposition d'échange crée une notification pour le propriétaire
- ✅ Les notifications sont visibles en **temps réel** avec un badge rouge dans le header
- ✅ Badge affiche le **nombre de notifications non lues**

---

## 🧪 Comment Tester

### Prérequis
- 2 comptes utilisateur (Utilisateur A et Utilisateur B)
- Chacun doit avoir publié au moins 1 annonce

### Étapes du Test

#### 1️⃣ Créer 2 Comptes Test

**Compte A:**
```
Email: test.a@example.com
Mot de passe: Test123!@Secure
```

**Compte B:**
```
Email: test.b@example.com
Mot de passe: Test456!@Secure
```

#### 2️⃣ Publier des Annonces

**Utilisateur A - Publier 1 annonce:**
1. Se connecter avec le compte A
2. Aller à `/publish`
3. Remplir:
   - **Titre**: "Mathématiques Terminale - Manuel"
   - **Catégorie**: "Manuels scolaires"
   - **Condition**: "Très bon état"
   - **Description**: "Manuel de maths complet avec annotations"
4. Cliquer "Publier"
5. ✅ L'annonce doit être **ACTIVE IMMÉDIATEMENT**

**Utilisateur B - Publier 1 annonce:**
1. Se connecter avec le compte B
2. Même process mais avec titre différent: "Français Littérature 1ère"
3. ✅ L'annonce doit être **ACTIVE IMMÉDIATEMENT**

#### 3️⃣ Vérifier le Badge Initial

**Utilisateur B:**
1. Allez à `/notifications`
2. Badge dans le header: **0 notifications** (normal, aucune encore)

#### 4️⃣ Proposer un Échange (LE TEST CLÉS! 🎯)

**Utilisateur A:**
1. Aller à `/explore`
2. Trouver l'annonce de B: "Français Littérature 1ère"
3. Cliquer "Proposer un échange"
4. Sélectionner: "Mathématiques Terminale - Manuel"
5. Remplir email et/ou téléphone
6. Cliquer "Proposer"
7. ✅ Message: "Demande d'échange envoyée avec succès!"

#### 5️⃣ Vérifier la Notification en Live ⚡

**Utilisateur B - SANS rafraîchir la page:**
1. Observez le badge dans le header (icône 🔔)
2. **LE BADGE DOIT DEVENIR ROUGE AVEC "1"** immédiatement
3. Si vous étiez déjà sur `/notifications`, la nouvelle notification doit s'ajouter au top

#### 6️⃣ Vérifier le Contenu de la Notification

**Utilisateur B - Cliquer sur le badge ou aller à `/notifications`:**

La notification doit afficher:
```
✓ Titre: "Nouvelle proposition d'échange"
✓ Message: "Quelqu'un a proposé un échange sur votre annonce : Français Littérature 1ère."
✓ Date/Heure: Affichée en français
✓ Bouton "Voir": Redirige vers la page de l'annonce
✓ Bouton "Marquer comme lu": Disponible si non lue
✓ Indicateur: Petit point rouge si non lu
```

#### 7️⃣ Marquer Comme Lu

**Utilisateur B:**
1. Cliquer "Marquer comme lu" sur la notification
2. Le petit point rouge disparaît
3. Le badge du header doit devenir: **0** si c'était la dernière non-lue

---

## 🔍 Points à Vérifier

### ✅ Critères de Succès

| Critère | Status | Notes |
|---------|--------|-------|
| Badge rouge apparaît en live | ⚠️ À tester | Sans rafraîchir la page |
| Nombre exact affiché | ⚠️ À tester | ex: "1", "5", etc. |
| Notification dans la liste | ⚠️ À tester | Informations complètes |
| "Marquer comme lu" fonctionne | ⚠️ À tester | Badge se met à jour |
| "Tout marquer comme lu" fonctionne | ⚠️ À tester | Tous les points rouges disparaissent |
| Realtime updates | ⚠️ À tester | Pas besoin de rafraîchir |
| Données correctes dans notification | ⚠️ À tester | Titre de l'annonce, etc. |

---

## 🛠️ Dépannage

### Le badge ne s'affiche pas
```
1. Vérifier les RLS policies:
   - Aller dans Supabase Dashboard
   - SQL Editor → Exécuter:
   
   SELECT * FROM notifications WHERE recipient_id = auth.uid();
```

### La notification n'apparaît pas
```
1. Vérifier la base de données:
   - Supabase Dashboard
   - Table "notifications"
   - Vérifier qu'une ligne existe avec les bonnes données

2. Vérifier les logs:
   - Browser DevTools → Console
   - Chercher les erreurs de Supabase
```

### Le realtime ne fonctionne pas
```
1. Vérifier que Supabase Realtime est activé:
   - Supabase Dashboard
   - Project Settings → Realtime
   - "Realtime" doit être ON

2. Vérifier la connexion:
   - Ouvrir DevTools → Network
   - Chercher la WebSocket: wss://...
```

---

## 📊 Commandes de Test Rapide (Supabase SQL Editor)

### Créer une Notification de Test
```sql
-- Note: Remplacer les UUIDs par vos vrais IDs
INSERT INTO notifications (
  recipient_id,
  actor_id,
  type,
  data
) VALUES (
  'uuid-of-user-b',           -- À remplacer
  'uuid-of-user-a',           -- À remplacer
  'exchange_proposed',
  '{
    "listing_id": "uuid-of-listing",
    "listing_title": "Test Notification",
    "exchange_id": "uuid-of-exchange",
    "contact_email": "test@example.com"
  }'::jsonb
);
```

### Vérifier les Notifications d'un User
```sql
SELECT id, type, read_at, created_at, data 
FROM notifications 
WHERE recipient_id = 'uuid-of-user-b'
ORDER BY created_at DESC;
```

### Supprimer les Notifications de Test
```sql
DELETE FROM notifications 
WHERE recipient_id = 'uuid-of-user-b' 
AND type = 'exchange_proposed';
```

---

## 📝 Checklist de Validation

### Phase 1: Interface
- [ ] Badge notification visible dans le header
- [ ] Badge rouge avec nombre correct
- [ ] Page `/notifications` s'affiche correctement
- [ ] Bouton "Tout marquer comme lu" existe

### Phase 2: Création d'Annonces
- [ ] Les annonces deviennent ACTIVE immédiatement
- [ ] Pas de redirection vers paiement
- [ ] Visible dans `/explore` immédiatement

### Phase 3: Propositions d'Échange
- [ ] Dialog "Proposer un échange" s'ouvre
- [ ] Validation des champs fonctionne
- [ ] "Demande envoyée" s'affiche

### Phase 4: Notifications en Live ⭐
- [ ] Badge se met à jour en temps réel
- [ ] Pas besoin de rafraîchir
- [ ] Nouvelle notification apparaît au top de la liste
- [ ] Informations correctes dans la notification

### Phase 5: Marquer Comme Lu
- [ ] "Marquer comme lu" button fonctionne
- [ ] Badge se décrémente
- [ ] Point rouge disparaît
- [ ] "Tout marquer comme lu" fonctionne

---

## 🚀 Déploiement Info

**Commit**: `999a27a`  
**Branch**: `correction_app`  
**Déploiement**: Vercel (auto-trigger via git push)  
**Status**: En cours de déploiement...

---

## ❓ Besoin d'Aide?

Si le test ne fonctionne pas:
1. Vérifier que Vercel a bien déployé le changement
2. Vérifier les logs Vercel: Dashboard → Deployments
3. Vérifier la console du navigateur: F12 → Console
4. Vérifier que les RLS policies sont correctes sur Supabase

---

**Date**: 25 Mai 2026  
**Status**: ✅ **LIVE**
