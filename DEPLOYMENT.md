# 🚀 DEPLOYMENT GUIDE - Vercel

## Status ✅
- ✅ Code committed and pushed to `correction_app` branch
- ✅ Build tested successfully (25 routes compiled)
- ✅ TypeScript strict mode enabled
- ✅ All components functional

## Commits Pushed
```
0aa13dd feat: Add notifications table creation script for Supabase
41179d6 feat: Add exchange proposal feature with real-time notifications
```

## STEP 1: Create Notifications Table in Supabase

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select project: **v0-academic-barter-platform**
3. Go to **SQL Editor**
4. Run the script from: `create_notifications_table.sql`
   - This creates the `notifications` table with RLS policies
   - Enables real-time notifications for exchanges

**Or run via CLI:**
```bash
psql "postgresql://[user]:[password]@[host]/[db]" < create_notifications_table.sql
```

## STEP 2: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select project: **v0-academic-barter-platform**
3. Vercel detects the new push automatically
4. Deployment starts automatically (~2-5 minutes)
5. Monitor build in "Deployments" tab

### Option B: Manual Deployment via CLI

```bash
# Terminal in project directory
vercel deploy --prod

# Log in when prompted (GitHub/Google/Email)
# Follow the prompts
# Build will start automatically
```

### Option C: Via GitHub (Pull Request)

1. Create Pull Request from `correction_app` → `main`
2. Vercel bot will:
   - Run build checks
   - Create preview deployment
   - Show status in PR
3. Once approved/merged to main, production deployment starts

## STEP 3: Verify Environment Variables

In Vercel Dashboard → Settings → Environment Variables, ensure these are set:

```
NEXT_PUBLIC_SUPABASE_URL=https://hvuanbavdwskskrsjnvi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_q98xFK-NEOahNKwj95tCkw_kC3Mxpv8
SUPABASE_SERVICE_ROLE_KEY=[YOUR_KEY]
```

## STEP 4: Test the Feature

After deployment is successful:

1. Go to production URL
2. View a listing from another user
3. Click **"Proposer un échange"** button (cyan-teal gradient)
4. Fill the form:
   - Select article to exchange
   - Enter email/phone
   - Click **"Proposer l'échange"**
5. ✅ Notification created in Supabase

## 🔧 What's New

### Components
- ✨ **exchange-proposal-dialog.tsx** - Modal form with validation
- 🎨 Cyan-teal-emerald gradient button with shimmer effect
- ✅ Real-time form validation (email/phone)

### Database
- 📊 **notifications** table with RLS policies
- 🔔 Stores exchange proposals with contact details

### Features
- 🔄 Replace "Contacter" with "Proposer un échange"
- 👤 Show user email if name missing
- 📱 Mobile-responsive modal
- ⚡ Optimized Supabase queries

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run build`
- Ensure all imports are correct
- Check Node version: `node --version` (should be 18+)

### Notifications Not Appearing
- Verify Supabase table exists: `SELECT * FROM notifications;`
- Check RLS policies are correct
- Ensure NEXT_PUBLIC_SUPABASE_URL is set in Vercel

### Rate Limiting Issues
- Wait 15 minutes between authentication attempts
- Use different email if needed

## Final Checklist

- [ ] Supabase notifications table created
- [ ] Environment variables in Vercel set
- [ ] Deployment started in Vercel
- [ ] Build succeeds (green checkmark)
- [ ] App loads at production URL
- [ ] Exchange proposal feature works
- [ ] Notifications appear in database

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase error logs
3. Review browser console (F12)
4. Check application logs in Vercel

---

**Deployment initiated**: 2026-05-11
**Status**: Ready for Vercel deployment
