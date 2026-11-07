# PitStop — Firebase Setup (shared project)

The whole team uses **one** Firebase project. Use these values; don't create your own project.

| | |
|---|---|
| Project name | PitStop |
| Project ID | `pitstop-5ba45` |
| Console | https://console.firebase.google.com/project/pitstop-5ba45 |
| Firestore | `(default)` database, Standard edition, **asia-south1 (Mumbai)** |
| Auth | **Google sign-in enabled** |
| Security rules | Published from `firestore.rules` (Part B) |
| Plan | Spark (free). Storage needs Blaze, so photo uploads won't work until someone upgrades |

## 1. Web app config (copy into `.env.local`)

These values are **public** by design (they ship to every visitor's browser), so they're safe to keep in this private repo.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBA9T3LkeW43KCtjUZUNZjJFpsheykOTSk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pitstop-5ba45.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pitstop-5ba45
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pitstop-5ba45.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=401753971738
NEXT_PUBLIC_FIREBASE_APP_ID=1:401753971738:web:9e968d52df6409f33045a3
```

## 2. Secrets — NOT in GitHub

These two are real secrets. Anyone who has them can read/write the whole database or spend our Claude credits. Never commit them, even to this private repo.

- `FIREBASE_SERVICE_ACCOUNT` — Firebase console → Project settings → **Service accounts** → **Generate new private key**. Paste the whole JSON on **one line**. Shaheryar generates it and sends it privately (WhatsApp).
- `ANTHROPIC_API_KEY` — **not shared with anyone.** It is set only in **Vercel → Project → Settings → Environment Variables** by whoever deploys. Locally, leave it empty: the app works, only the AI Assistant and the "Someone already asked this" check show an error. Test those two on the deployed site.

## 3. To-dos before the demo

- [ ] Put `FIREBASE_SERVICE_ACCOUNT` in your own `.env.local`.
- [ ] On Vercel, add all the variables above, including `ANTHROPIC_API_KEY` (the only place it lives).
- [ ] Run the seed once: `npm run seed` (Part B's `scripts/seed.ts`).
- [ ] Create Firestore indexes: open each screen once and click the "index required" link, or run `firebase deploy --only firestore:indexes` (uses `firestore.indexes.json`).
- [ ] Add the Vercel domain in Authentication → Settings → **Authorized domains** after the first deploy, or Google sign-in fails on the live site.
- [ ] Optional: upgrade to Blaze (with a ~$5 budget alert) so product/portfolio photo uploads work.
