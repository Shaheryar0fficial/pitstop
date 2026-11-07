# PitStop — Part B: Stores, Parts & Community
### 1-Day Hackathon · Firebase · Built in parallel with Part A

**Part B owns:** constants, security rules, seed data, stores, products, parts browsing, the store owner inbox, store billing, the community feed, and the duplicate-question check.
**Part A owns:** app setup and auth, onboarding, need posting, the provider inbox, offers and approval, provider profiles, provider billing, and the AI Bike Assistant.

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

## Part B — Your Features

### B1. Constants, Rules & Seed (0:00–1:00)
- `lib/bikes.ts`: about 20 bikes as `{ key: "honda-cbr150r", label: "Honda CBR150R" }`, plus Other.
- `lib/skills.ts`: General · Engine · Electrical · Tuning · Detailing · Tyres · Modification · Bodywork & Paint
- `lib/partTypes.ts`: Headlight · Tail light · Indicators · Brake pads · Chain & sprocket kit · Tyre · Battery · Air filter · Oil filter · Mirrors · Body panels · Exhaust · Other
- `firestore.rules`: copy from the Security Rules section below and deploy it.
- `scripts/seed.ts` (Admin SDK). Use fixed IDs:
  - 6 providers across Lahore, Karachi, and Islamabad (`detailer-lhr`, `tuner-lhr`, ...)
  - **Ratings and reviews for every provider:** 2–4 reviews each in `users/{id}/reviews`, with `rating` and `ratingCount` on the user document set to match. The MVP has no "write a review" feature, so the seed is the only place reviews come from. A shows them read-only.
  - 2 riders (`rider1`, `rider2`)
  - 3 stores (`store1` to `store3`) with 20 products
  - 10 community threads with replies
  - `config/pricing`

**Done when:** A can run the seed and see data in the console.

### B2. Stores & Products (1:00–2:30)
- `stores/new`: name, city, area, logo, and WhatsApp number. Writes `stores/{uid}`. *This is what the store placement fee is charged for.*
- `products/new`: name, part type, compatible bikes (multi-select), condition, price in Rs., and photos (at least 1). *Each product is charged a fee.*
  - Condition: `New – Genuine` · `New – Copy` · `Used – Genuine`
- `stores/[id]`: store details, its active products, and a WhatsApp button. The owner gets a **Mark as sold** button. Products are never deleted.

### B3. Parts Browse + `<MatchingProducts />` (2:30–3:30)
- `parts`: filter by bike and part type, and show product cards.
- `components/store/MatchingProducts.tsx` (props `bikeKey, partType`): `products` where `bikeKeys array-contains bikeKey`, `partType == partType`, `status == "active"`. Show cards with a pre-filled WhatsApp button: *"Hi, I saw your <part> for <bike> on PitStop"*.

**Done when:** you open a seeded part request's bike and part type and matching products appear.

### B4. `<StoreInbox />` + Product Suggestions (3:30–4:30)
- `components/store/StoreInbox.tsx` (prop `uid`): live query on `posts` where `type == "part"`, `status == "open"`, order by `createdAt desc`.
- Each card links to `posts/[id]`. There, `<Replies allowProductSuggest />` lets a store owner pick one of their own products and post it as a reply with `productId`. This is free.

**Merge at 4:30:** `MatchingProducts` and `StoreInbox`.

### B5. `<StoreBill />` (4:30–5:15)
- `lib/billing-store.ts`: `storeMonthlyFee` + `count()` of `products` where `storeId == uid`, `createdAt >= start of this month`, multiplied by `productFee`.
- `components/store/StoreBill.tsx` (prop `uid`): *"Store placement Rs. X + N products × Rs. Y = Rs. Z due this month"*.

### B6. Community Feed + `<Replies />` (5:15–7:00)
- `app/page.tsx`: posts where `type == "question"` (+ an optional bike filter), order by `createdAt desc`.
- `components/community/Replies.tsx` (props `postId, allowProductSuggest`):
  - list replies sorted by upvotes, with a "Mechanic" badge for providers
  - a reply box; posting a reply also increments `replyCount`
  - an upvote button that increments `upvotes`
  - a product picker when `allowProductSuggest` is on and the user is a store owner

### B7. Duplicate Check: `/api/similar` + `<SimilarThreads />` (7:00–7:30)
- `api/similar/route.ts`:
  1. Verify the Firebase ID token.
  2. Load the 30 latest question posts for `bikeKey`.
  3. Ask Claude (structured JSON output, low effort, English only) for up to 3 similar post IDs.
- `components/community/SimilarThreads.tsx` (props `text, bikeKey`): wait until the rider stops typing (about 800 ms) and the text is 20+ characters, then call the route. Show *"Someone already asked this — here's what riders said"* with links.
- Use `lib/claude.ts` from A for the Anthropic client.

**Merge at 7:30:** `Replies`, `StoreBill`, `SimilarThreads`.

### B8. Integration & Polish (7:30–10:00)
- Help A tick off the Integration Checklist.
- Rehearse the demo together.

---

## Security Rules (you own `firestore.rules`)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function onlyChanged(keys) {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly(keys);
    }

    match /users/{uid} {
      allow read: if true;
      allow write: if signedIn() && request.auth.uid == uid;
      match /reviews/{id} {
        allow read: if true;
        allow create: if signedIn() && request.resource.data.riderId == request.auth.uid;
      }
    }

    match /posts/{postId} {
      allow read: if true;
      allow create: if signedIn()
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.status == 'open';
      allow update: if signedIn() && (
        (resource.data.authorId == request.auth.uid && onlyChanged(['status', 'approvedOfferId']))
        || onlyChanged(['upvotes', 'replyCount'])
      );
      match /replies/{id} {
        allow read: if true;
        allow create: if signedIn() && request.resource.data.authorId == request.auth.uid;
        allow update: if signedIn() && onlyChanged(['upvotes']);
      }
    }

    match /offers/{offerId} {
      allow read: if signedIn();
      allow create: if signedIn()
        && request.resource.data.providerId == request.auth.uid
        && request.resource.data.status == 'pending'
        && get(/databases/$(db)/documents/posts/$(request.resource.data.postId)).data.authorId
           == request.resource.data.postAuthorId;
      allow update: if signedIn()
        && resource.data.postAuthorId == request.auth.uid
        && onlyChanged(['status', 'approvedAt'])
        && request.resource.data.status in ['approved', 'declined']
        && (request.resource.data.status != 'approved' || request.resource.data.approvedAt == request.time);
    }

    match /stores/{ownerId} {
      allow read: if true;
      allow create, update: if signedIn() && request.auth.uid == ownerId;
    }

    match /products/{id} {
      allow read: if true;
      allow create: if signedIn()
        && request.resource.data.storeId == request.auth.uid
        && exists(/databases/$(db)/documents/stores/$(request.auth.uid));
      allow update: if signedIn() && resource.data.storeId == request.auth.uid;
      allow delete: if false;   // mark as "sold" so billing counts stay honest
    }

    match /config/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Your Firestore Indexes
Firestore logs a link for each missing index. Click it and wait about a minute. You will need:
- `products`: `bikeKeys` (array-contains) + `partType` + `status`
- `products`: `storeId` + `createdAt`
- `posts`: `type` + `status` + `createdAt desc`
- `posts`: `type` + `bikeKey` + `createdAt desc`

## Your Gotchas
- Product photos use Firebase Storage, which needs the Blaze plan. If you can't add a card, use Cloudinary unsigned upload.
- Increment counters with `increment(1)`, never read-then-write.
- Seed with the Admin SDK. It bypasses the rules, so the seed works before the rules are final.

---

## Demo Script (your parts in bold)

1. Rider posts a detailing request and the detailer's inbox updates live *(Part A)*.
2. Offer → approve → WhatsApp → provider billing *(Part A)*.
3. **Rider picks Part → Headlight, Ninja 400. Matching products from 2 stores appear, one labelled New – Copy. Switch to a store owner's Billing page: store fee + product fees.**
4. Assistant → Post this as a need *(Part A)*.
5. **If there's time: start typing "engine noise at idle" → "Someone already asked this".**
6. Close on the revenue table.
