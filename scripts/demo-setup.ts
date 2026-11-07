// Demo prep for YOUR real Google accounts (the seed's users can't sign in).
//
// 1. Sign in to the app with each demo account and finish onboarding
//    (pick Rider / Service Provider / Store Owner).
// 2. Run:  npm run demo-setup
//
// For every real (non-seed) account it finds:
//   - Store Owner without a store → creates a verified store + 3 products
//     (including a Ninja 400 headlight, so it shows up in the parts demo).
//   - Service Provider without reviews → adds 3 reviews and a 4.7 rating.
// Safe to run again: accounts that already have a store / reviews are skipped.

import { cert, initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT is not set in .env.local.");
  process.exit(1);
}
const sa = JSON.parse(raw);
if (typeof sa.private_key === "string") sa.private_key = sa.private_key.replace(/\\n/g, "\n");
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const SEED_IDS = new Set([
  "rider1", "rider2", "detailer-lhr", "tuner-lhr", "general-lhr", "general-khi",
  "electric-khi", "detailer-isb", "store1", "store2", "store3",
]);

const now = () => Timestamp.now();

async function main() {
  const users = await db.collection("users").get();
  const real = users.docs.filter((d) => !SEED_IDS.has(d.id));
  if (real.length === 0) {
    console.log("No real accounts yet. Sign in to the app with your demo accounts, finish onboarding, then run this again.");
    return;
  }

  for (const u of real) {
    const p = u.data() as { name?: string; role?: string; city?: string; whatsapp?: string; ratingCount?: number };
    const name = p.name ?? "Demo user";

    if (p.role === "store_owner") {
      const storeRef = db.doc(`stores/${u.id}`);
      if ((await storeRef.get()).exists) {
        console.log(`Store owner "${name}": already has a store, skipped.`);
        continue;
      }
      const store = {
        ownerId: u.id,
        name: "PitStop Demo Parts",
        city: p.city || "Lahore",
        area: "Hall Road",
        logoURL: "",
        whatsapp: p.whatsapp ?? "",
        verified: true,
        createdAt: now(),
      };
      await storeRef.set(store);
      const products = [
        { name: "Ninja 400 Projector Headlight (Genuine)", partType: "headlight", bikeKeys: ["kawasaki-ninja400"], condition: "new_genuine", price: 36000 },
        { name: "Ninja 400 Brake Pads (Front + Rear)", partType: "brake_pads", bikeKeys: ["kawasaki-ninja400", "kawasaki-ninja250"], condition: "new_genuine", price: 7800 },
        { name: "CBR250RR Air Filter", partType: "air_filter", bikeKeys: ["honda-cbr250rr"], condition: "new_copy", price: 2600 },
      ];
      for (const pr of products) {
        await db.collection("products").add({
          storeId: u.id,
          storeName: store.name,
          city: store.city,
          whatsapp: store.whatsapp,
          ...pr,
          photos: [],
          status: "active",
          createdAt: now(),
        });
      }
      console.log(`Store owner "${name}": created "${store.name}" (${store.city}) with ${products.length} products.`);
    } else if (p.role === "provider") {
      if ((p.ratingCount ?? 0) > 0) {
        console.log(`Provider "${name}": already has reviews, skipped.`);
        continue;
      }
      const reviews = [
        { riderId: "rider1", riderName: "Ali Raza", rating: 5, text: "Spotless work and on time. Highly recommended." },
        { riderId: "rider2", riderName: "Sara Khan", rating: 5, text: "Explained everything and charged exactly what he quoted." },
        { riderId: "rider1", riderName: "Ali Raza", rating: 4, text: "Great job, slightly busy on weekends." },
      ];
      for (const [i, r] of reviews.entries()) {
        await db.doc(`users/${u.id}/reviews/demo-r${i + 1}`).set({ ...r, createdAt: now() });
      }
      await u.ref.update({ rating: 4.7, ratingCount: reviews.length });
      console.log(`Provider "${name}": added ${reviews.length} reviews, rating 4.7.`);
    } else {
      console.log(`Rider "${name}": nothing to set up.`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
