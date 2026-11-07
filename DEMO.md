# PitStop — Demo Happy Flow

## 1. Run the app

```bash
cd "D:\AI Hackathon\Hackathon 1\PitStop App"
npm run dev
```

Open **http://localhost:3000**. (New laptop: `npm install` first, and copy `.env.local` privately — it is never in GitHub.)

## 2. One-time prep (about 5 minutes, do it before the pitch)

Every Google account has **one role**. Use **3 Google accounts in 3 separate Chrome windows** — e.g. your normal profile, a second Chrome profile, and an Incognito window.

| Window | Sign in, then onboarding | Must pick |
|---|---|---|
| **A — Rider** (left) | Role **Rider** | City **Lahore** |
| **B — Detailer** (right) | Role **Service Provider** | City **Lahore**, skills **Detailing** + **General** |
| **C — Store owner** (extra tab) | Role **Store Owner** | City **Lahore** |

Then run once:

```bash
npm run demo-setup
```

This gives account **C** a verified store, *PitStop Demo Parts*, with 3 products (incl. a Ninja 400 headlight), and gives account **B** 3 reviews and a 4.7 rating.

Optional reset of the demo data (stores, products, threads, the sample requests): `npm run seed`.

## 3. The 3-minute demo

**① Post & route (40s)** — Window A: **Post a need → Service → Detailing**, bike **Honda CBR250RR**, city **Lahore**, text *"Full detailing before a weekend ride."* → Post.
Window B (Detailer) → **Inbox**: the request appears **live**. *Say: "Only detailers in Lahore see this — a tuner's inbox stays empty."*

**② Offer & approve (40s)** — Window B: open the request → send an offer (e.g. Rs. 3,500, "Saturday 11am").
Window A: the offer appears → **Approve** → status **Assigned**, WhatsApp button appears.
*Say: "Riders connect only after approving, and that's when providers pay."*
Window B → **Billing**: *1 approved request · Rs. 150 due.*

**③ Parts (40s)** — Window A: **Post a need → Part → Headlight**, bike **Kawasaki Ninja 400**, Lahore → Post.
The request page shows **4 matching headlights from 4 stores**, one labelled **New – Copy**, each with a **WhatsApp seller** button.
Window C (Store owner) → **Inbox**: the request is there with *"1 of your products matches"* → open it → **Suggest one of your products** → pick the headlight → **Suggest product**. Window A sees it in the replies.
Window C → **Billing**: *Store placement Rs. 2,000 + 3 products × Rs. 50 = Rs. 2,150.*

**④ Community (30s)** — Any window → **Community** → filter by bike → open *"Engine noise at idle…"* → show the **Mechanic** badge and **Top answer** → post a reply → ▲ upvote.

**⑤ Close (15s)** — Revenue: riders free · providers pay per approved job (Rs. 150) · stores pay for placement (Rs. 2,000/month) + Rs. 50 per product.

## 4. Pages that work without signing in (backup if sign-in fails)

- `/posts/part-req1` — Ninja 400 headlight request with matching products (the parts demo moment)
- `/parts` — all 20+ products, filter by bike and part type
- `/stores/store1` — a verified store page
- `/` and `/posts/q1` — community feed and a thread

## 5. Known limits (say "next update" if asked)

- **AI Bike Assistant** — shows a "coming soon" page.
- **"Someone already asked this"** — needs the Claude key (only on Vercel).
- **Photo uploads** — need Firebase's Blaze plan; products show a part-type tile instead.
