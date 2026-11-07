# PitStop — Part A: Riders, Services & AI
### 1-Day Hackathon · Firebase · Built in parallel with Part B

**Part A owns:** app setup and auth, onboarding, need posting, the provider inbox, offers and approval, provider profiles, provider billing, and the AI Bike Assistant.
**Part B owns:** stores, products, parts browsing, the store owner inbox, store billing, the community feed, and the duplicate-question check.

The two parts share one Firebase project, one data model, and one repo. They meet only through the **Shared Contract** below, so both developers can build all day without waiting on each other.

---

## Shared Contract (identical in Part A and Part B)

### Stack
Next.js (App Router) on Vercel · Firebase Auth (Google sign-in) · Cloud Firestore · Firebase Storage · Firebase Admin SDK (server only) · Claude API (`claude-opus-5-5`) for 2 API routes.

`.env.local`: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT`, `ANTHROPIC_API_KEY`. Never put a `NEXT_PUBLIC_` prefix on the Claude key.

### Revenue (what the billing pages show)
| Who pays | For what | Example price | Counted when |
|---|---|---|---|
| Service provider | Each request a rider **approves** | Rs. 150 | The rider taps Approve |
| Store owner | Placing their store | Rs. 2,000 / month | Every month the store is active |
| Store owner | Each product placed | Rs. 50 | The product is listed |

Prices live in `config/pricing`. Riders are free. Payment is collected offline (JazzCash, Easypaisa, or bank transfer).

### Data Model
```ts
// users/{uid}
{ name, photoURL, city, whatsapp: "923001234567",
  role: "rider" | "provider" | "store_owner",
  skills: ["detailing"], brands: ["Honda"], portfolio: [url],   // providers only
  rating: 4.6, ratingCount: 12 }
// users/{uid}/reviews/{id}  → { riderId, riderName, rating: 1-5, text, createdAt }

// posts/{postId}
{ authorId, authorName, city, bikeKey, bikeLabel,
  type: "service" | "part" | "question",
  skill: string | null, partType: string | null,
  text, photos: [url],
  status: "open" | "assigned" | "closed", approvedOfferId: null,
  upvotes: 0, replyCount: 0, createdAt }
// posts/{postId}/replies/{id} → { authorId, authorName, role, text, upvotes, productId?, createdAt }

// offers/{offerId}
{ postId, postAuthorId, providerId, providerName, providerRating,
  message, priceEstimate, when,
  status: "pending" | "approved" | "declined", createdAt, approvedAt }

// stores/{ownerUid}
{ ownerId, name, city, area, logoURL, whatsapp, verified, createdAt }

// products/{productId}
{ storeId, storeName, city, whatsapp, name, partType, bikeKeys: [],
  condition: "new_genuine" | "new_copy" | "used_genuine",
  price, photos: [url], status: "active" | "sold", createdAt }

// config/pricing
{ approvedRequestFee: 150, storeMonthlyFee: 2000, productFee: 50 }
```

### File Ownership (prevents merge conflicts)
| Owner | Files |
|---|---|
| **A** | `lib/firebase.ts`, `lib/firebase-admin.ts`, `lib/types.ts` (shared types + city list), `lib/claude.ts`, `storage.rules`, `components/shell/*` (nav, auth gate, placeholders), `app/layout.tsx` (nav), `app/onboarding/*`, `app/post/new/*`, `app/posts/[id]/*`, `app/inbox/*`, `app/providers/[id]/*`, `app/billing/*`, `app/assistant/*`, `app/api/assistant/*`, `components/provider/*`, `lib/billing-provider.ts` |
| **B** | `lib/bikes.ts`, `lib/skills.ts`, `lib/partTypes.ts`, `firestore.rules`, `scripts/seed.ts`, `app/page.tsx` (feed), `app/stores/*`, `app/products/*`, `app/parts/*`, `app/api/similar/*`, `components/store/*`, `components/community/*`, `lib/billing-store.ts` |

Rule: edit only your own files. If you need a change in the other person's file, ask them.

### Integration Components (B builds them, A places them)
| Component | Props | A places it in |
|---|---|---|
| `<MatchingProducts />` | `bikeKey, partType` | `posts/[id]` when `type == "part"` |
| `<Replies />` | `postId, allowProductSuggest` | `posts/[id]` when `type` is `"part"` or `"question"` |
| `<SimilarThreads />` | `text, bikeKey` | `post/new` when `type == "question"` |
| `<StoreInbox />` | `uid` | `inbox` when `role == "store_owner"` |
| `<StoreBill />` | `uid` | `billing` when `role == "store_owner"` |

Until B delivers a component, A renders a placeholder `<div>` with the same props, so A's pages never wait on B.

### Shared Helpers
`lib/firebase.ts` (A) exports `auth`, `db`, `storage`, `useUser()` → `{ uid, role, city, skills, ... } | null`.
`lib/bikes.ts`, `lib/skills.ts`, `lib/partTypes.ts` (B) export arrays of `{ key, label }`.

### Checkpoints (merge to `main`)
| Time | What gets merged |
|---|---|
| **1:00** | A: app skeleton, auth, `useUser()`. B: constants, rules, seed. Both run the seed against the shared project. |
| **4:30** | Each side merges what works. A swaps placeholders for any B components that are ready. |
| **7:30** | Feature freeze. All 5 integration components are in place. |
| **9:00** | Bugs fixed. Rehearse the demo together twice. |

### Integration Rules (so merging takes minutes, not hours)
1. **One Firebase project, one repo.** Each person works on their own branch (`part-a`, `part-b`) and merges to `main` only at the checkpoints.
2. **Never rename a field** in the data model without telling the other person. The data model above is the contract.
3. **Components are self-contained.** Each B component reads Firestore itself from its props. A only passes props in; nothing is passed back out.
4. **Placeholders first.** A ships each slot as `<div>MatchingProducts {bikeKey} {partType}</div>` and replaces it with the real import at a checkpoint. That swap is one line.
5. **Seed data is shared.** Both test against the same seed (B's `scripts/seed.ts`), so the pages look the same when merged.
6. **Same seed IDs for testing.** Seeded users use fixed IDs (`rider1`, `detailer-lhr`, `tuner-lhr`, `store1`, ...) so both developers can open the same records.

### Integration Checklist (at 7:30)
- [ ] `posts/[id]` shows `<MatchingProducts />` and `<Replies />` for part requests
- [ ] `posts/[id]` shows `<Replies />` for questions
- [ ] `post/new` shows `<SimilarThreads />` for questions
- [ ] `inbox` shows `<StoreInbox />` for store owners
- [ ] `billing` shows `<StoreBill />` for store owners
- [ ] `firestore.rules` deployed (`firebase deploy --only firestore:rules`)
- [ ] Full demo runs on the deployed Vercel URL

### Before the Pitch (these break the demo if skipped)
- [ ] **Create every Firestore index in advance.** Open every screen once on the deployed site and click each "index required" link in the console.
- [ ] **Approve uses `serverTimestamp()` for `approvedAt`**, or the security rules reject it.
- [ ] **The Vercel domain is in Firebase Auth → Authorized domains**, or Google sign-in fails on stage.

### MVP Limits (decided — don't build these)
- **Keep the security rules as written.** They already block the important things: providers can't approve their own offers, products can't be deleted, and approval uses server time.
- **Skipped for now:** locking ratings, blocking backdated products, the verified badge, and stopping fake upvotes.
- **If a judge asks:** *"Billing fields get locked down in the security rules after the hackathon. For the MVP, we track what's owed."*

---

## Part A — Your Features

### A1. Setup & Auth (0:00–1:00)
- Create the Next.js app, the Firebase project (Auth, Firestore, Storage), and the Vercel deploy.
- Turn on Google sign-in. Add the Vercel domain under Auth → Settings → Authorized domains.
- Write `lib/firebase.ts` with `useUser()`, `lib/firebase-admin.ts`, and the nav bar in `app/layout.tsx`.
- Share the Firebase config and service account with B.

**Done when:** a blank app is live on Vercel and Google sign-in works.

### A2. Onboarding (1:00–2:00)
- After first sign-in, the user picks a role, a city, and a WhatsApp number.
- Providers also pick skill tags, bike brands, and up to 4 portfolio photos.
- Store owners are sent to `/stores/new`, which B builds.

### A3. Post a Need (2:00–3:00)
The rider decides the type. There is **no AI classification**.
1. Three buttons: **Service** · **Part** · **Question**
2. Service → skill dropdown. Part → part-type dropdown. Question → show `<SimilarThreads />`.
3. Bike dropdown, city, description, and optional photos.
4. Write the post straight to `posts` with `status: "open"`.

| Type | Who sees it |
|---|---|
| Service + skill | Providers with that skill in the same city |
| Part + part type | All store owners (B's `<StoreInbox />`) |
| Question | Community feed (B) |

### A4. Provider Inbox (3:00–3:30)
- Live query (`onSnapshot`): `posts` where `type == "service"`, `skill in mySkills`, `city == myCity`, `status == "open"`, order by `createdAt desc`.
- Store owners see `<StoreInbox />` here instead.

**Done when:** a post on laptop A appears in the inbox on laptop B within 2 seconds.

### A5. Offers & Approval (3:30–4:30)
Build this on `posts/[id]`:
- **Provider:** "Send offer" form with a message, a price estimate in Rs., and a time. Writes to `offers` with `status: "pending"`. Sending an offer is free.
- **Rider:** sees the offers sorted by `providerRating` and taps **Approve**:
  - set the offer to `status: "approved"`, `approvedAt: serverTimestamp()`
  - set the post to `status: "assigned"`, `approvedOfferId`
- **Approve in one `writeBatch`.** Both updates go in the same batch so they always land together:
  ```ts
  const batch = writeBatch(db);
  batch.update(doc(db, "offers", offerId), { status: "approved", approvedAt: serverTimestamp() });
  batch.update(doc(db, "posts", postId), { status: "assigned", approvedOfferId: offerId });
  await batch.commit();
  ```
- **After approval:**
  - the post shows **Assigned**
  - the Approve button on every other offer is **disabled** (`post.status !== "open"`)
  - the **WhatsApp button appears only here, on the request page**, for the rider and the approved provider: `wa.me/<number>?text=Hi, about my <bike> <skill> request on PitStop`

> Pitch line: **"Riders connect only after approving, and that's when providers pay."**

**Done when:** the rider approves → the request shows Assigned → the other Approve buttons are disabled → WhatsApp opens → the provider's bill shows 1 approved request.

### A6. Provider Profile (4:30–4:45)
- `providers/[id]`: name, city, skills, brands, portfolio, rating, and approved-jobs count.
- **No WhatsApp button on the public profile.** Contact opens only after an approval (A5).
- **Reviews are read-only.** Ratings and reviews come from B's seed script. List `users/{id}/reviews` and show the seeded `rating` and `ratingCount`. There is no "write a review" in the MVP.

### A7. Billing Page (4:45–5:30)
- `lib/billing-provider.ts`: `count()` of `offers` where `providerId == me`, `status == "approved"`, `approvedAt >= start of this month`, multiplied by `approvedRequestFee`.
- `billing/page.tsx`: providers see *"N approved requests · Rs. X due this month"*. Store owners see `<StoreBill />`.

### A8. AI Bike Assistant (5:30–7:30)
- `api/assistant/route.ts`: verify the Firebase ID token (`adminAuth.verifyIdToken`), then stream a Claude reply.
- System prompt rules:
  - English only, Pakistani heavy-bike context
  - Give 2–3 likely causes, DIY or pro, and the mechanic type
  - Give a time and a cost range in Rs., labelled as estimates
  - For brakes, steering, or a fuel leak, tell the rider to stop riding and see a pro
  - End with one line: `Mechanic: <one of the 8 skill tags>`
- **"Post this as a need"** opens `post/new` pre-filled with type = Service, the skill from the `Mechanic:` line, and the rider's problem. The rider confirms before posting.

**Done when:** *"My CBR 150 is vibrating at high speed"* → a diagnosis with Rs. 500–800 → Post this as a need → the form is pre-filled with General.

### A9. Integration & Polish (7:30–10:00)
- Replace every placeholder with B's real components.
- Run the full demo end to end, then rehearse it with B.

---

## Your Firestore Indexes
Firestore logs a link for each missing index. Click it and wait about a minute. You will need:
- `posts`: `type` + `skill` (in) + `city` + `status` + `createdAt desc`
- `offers`: `postId` + `providerRating desc`
- `offers`: `providerId` + `status` + `approvedAt`

## Your Gotchas
- Use `serverTimestamp()` for `approvedAt`. The security rule checks it against `request.time`.
- Store the service account JSON as one Vercel env var, and replace `\\n` with `\n` in `private_key` when you load it.
- Storage needs the Blaze plan. Set a budget alert of about $5.

---

## Demo Script (your parts in bold)

1. **Rider picks Service → Detailing, CBR250RR, Lahore. The detailer's inbox updates live; the tuner's doesn't.**
2. **The detailer sends an offer. The rider approves it: the request shows Assigned, the other offers can't be approved, and WhatsApp appears for the first time. Say: "Riders connect only after approving, and that's when providers pay." The detailer's Billing page shows 1 approved request · Rs. 150 due.**
3. Part request for a Ninja 400 headlight → matching products appear → store owner billing *(Part B)*.
4. **Assistant: CBR 150 vibration → diagnosis → Post this as a need → form pre-filled with General.**
5. Close on the revenue table.
