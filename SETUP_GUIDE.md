# 🚀 Guide de Setup & Développement - ɖyɔ̌

## 1️⃣ Configuration Initiale

### Prérequis
- Node.js 18+
- npm/yarn/pnpm
- Compte Supabase

### Installation

```bash
# 1. Cloner le repo
git clone <repo-url>
cd v0-academic-barter-platform

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local

# Puis éditer .env.local avec tes clés Supabase:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
# SUPABASE_SERVICE_ROLE_KEY=xxx (optionnel)

# 4. Lancer le serveur dev
npm run dev
```

Ouvre **http://localhost:3000** 🎉

---

## 2️⃣ Architecture du Projet

```
app/
├── (dashboard)/          # Routes protégées (auth required)
│   ├── dashboard/
│   ├── explore/
│   ├── listing/
│   ├── profile/
│   ├── publish/
│   └── error.tsx        # ✅ Error boundary pour dashboard
├── auth/                # Pages d'auth publiques
├── blog, pricing, etc/  # Pages statiques
└── error.tsx            # ✅ Error boundary root

components/
├── dashboard/           # Composants du dashboard
├── explore/             # Composants explore
├── listings/            # Cartes produit
├── ui/                  # Composants réutilisables (Radix UI)
└── ...

lib/
├── supabase/
│   ├── server.ts       # Client serveur (SSR)
│   ├── client.ts       # Client browser
│   └── middleware.ts   # Auth middleware
├── utils.ts            # Utilitaires (cn, etc.)
└── geocoding.ts        # Géolocalisation
```

---

## 3️⃣ Développement

### Scripts Disponibles

```bash
npm run dev       # 🚀 Serveur dev (localhost:3000)
npm run build     # 🏗️  Build production
npm run start     # ▶️  Lancer serveur prod
npm run lint      # 🔍 Check code avec ESLint
```

### TypeScript Strict

✅ **TypeScript strict est maintenant ACTIVÉ** pour la production.

Si tu vois des erreurs TS:
```bash
npm run build  # Voir toutes les erreurs
```

### Patterns à Respecter

#### ✅ Server Components pour Data Fetching
```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*')
  return <DashboardWelcome profile={profile} />
}
```

#### ✅ Suspense + Skeleton Loading
```typescript
<Suspense fallback={<StatsLoading />}>
  <DashboardStats userId={user.id} />
</Suspense>
```

#### ✅ Client Components pour Interactivité
```typescript
'use client'
import { useState } from 'react'

export function ExploreFilters() {
  const [filters, setFilters] = useState({})
  return <div>...</div>
}
```

---

## 4️⃣ Database (Supabase)

### Schéma Principal

```sql
-- Profils utilisateurs
profiles (id, full_name, email, university, city, bio, avatar_url, rating, etc.)

-- Annonces
listings (id, user_id, title, description, category_id, condition, images, lat, lng, status)

-- Catégories
categories (id, name, name_fr, icon, color)

-- Favoris
favorites (id, user_id, listing_id)

-- Conversations
conversations (id, listing_id)
conversation_participants (id, conversation_id, user_id)
messages (id, conversation_id, sender_id, content, read)

-- Échanges
exchanges (id, giver_id, receiver_id, listing_id, status)

-- Notifications
notifications (id, user_id, type, related_id, read)
```

### Importantes: Row Level Security (RLS)

⚠️ **À activer sur Supabase:**

```sql
-- Profiles: Publique en lecture, propriétaire en écriture
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: Publique en lecture, owner en write/delete
CREATE POLICY "Listings are viewable by everyone"
  ON listings FOR SELECT USING (true);

CREATE POLICY "Users can create listings"
  ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages: Only participants can read/write
CREATE POLICY "Users can read their conversations"
  ON messages FOR SELECT 
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE id IN (
        SELECT conversation_id FROM conversation_participants 
        WHERE user_id = auth.uid()
      )
    )
  );
```

### Seed Data

```bash
# Pour Bénin (3 utilisateurs test)
psql -U postgres -h xxx.supabase.co -d postgres < seed_users_benin.sql
```

---

## 5️⃣ Déploiement (Vercel)

### Setup

```bash
# 1. Connecter le repo à Vercel
vercel link

# 2. Ajouter variables env
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 3. Déployer
vercel deploy --prod
```

### Checks avant Deploy

```bash
✅ npm run build   # Sans erreurs
✅ npm run lint    # Sans warnings
✅ RLS activé sur DB
✅ .env.local PAS committé (.gitignore)
✅ SUPABASE_SERVICE_ROLE_KEY sécurisé (jamais en .env.local)
```

---

## 6️⃣ Troubleshooting

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL"
→ `.env.local` n'existe pas ou mal configuré

### Error: "Supabase connection failed"
→ Vérifier URL/keys dans `.env.local`
→ Vérifier que Supabase project existe

### Error: "Middleware is deprecated"
→ Message d'avertissement, fonctionne toujours
→ À migrer vers `proxy` dans les prochaines versions Next.js

### Error: TypeScript build fails
→ Nouvelle validation stricte activée
→ Fixer les erreurs TS ou désactiver (mais pas recommandé!)

---

## 7️⃣ Workflow de Développement

### Ajouter une Feature

```bash
# 1. Créer une branche
git checkout -b feature/ma-feature

# 2. Développer
# Modifier composants, pages, DB schema

# 3. Tester localement
npm run dev
# Vérifier dans http://localhost:3000

# 4. Build test
npm run build

# 5. Commit
git add .
git commit -m "feat: description de la feature"

# 6. Push & PR
git push origin feature/ma-feature
# Créer une Pull Request
```

### Before Committing

```bash
npm run lint    # Fix linting issues
npm run build   # Ensure production build works
```

---

## 8️⃣ Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## ✅ Checklist - Prêt pour Grandes Modifs?

- [x] TypeScript strict activé
- [x] Error boundaries ajoutées
- [x] .env.local configuré
- [x] Dépendances installées
- [x] Build production successful
- [ ] RLS Supabase configuré (À faire manuellement)
- [ ] Tests implémentés
- [ ] CI/CD setup (GitHub Actions)

**Tu es prêt! 🚀**
