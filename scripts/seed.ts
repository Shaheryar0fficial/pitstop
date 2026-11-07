// Part B owns this file. Demo data for the shared Firebase project.
//
// Run:   npm run seed
// (same as: node --env-file=.env.local scripts/seed.ts)
//
// Uses the Admin SDK, so it bypasses the security rules. Every document has a
// fixed ID (rider1, detailer-lhr, store1, ...), so running it again simply
// overwrites the demo data instead of duplicating it. It does not create
// Firebase Auth accounts: demo users sign in with Google as themselves.
//
// Self-contained on purpose (no "@/..." imports): it runs with plain Node, and
// lib/firebase-admin.ts imports "server-only", which throws outside Next.js.
// The bike, skill and part-type keys below match lib/bikes.ts, lib/skills.ts
// and lib/partTypes.ts.

import { cert, initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore, type WriteBatch } from "firebase-admin/firestore";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT is not set. Fill in .env.local first (see .env.local.example).");
  process.exit(1);
}
const serviceAccount = JSON.parse(raw);
if (typeof serviceAccount.private_key === "string") {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Spread createdAt over the last few hours so ordering looks natural and
// everything falls inside the current billing month.
const now = Date.now();
const minutesAgo = (m: number) => Timestamp.fromMillis(now - m * 60_000);

// ---------------------------------------------------------------- users

type Review = { riderId: string; riderName: string; rating: number; text: string };
type Provider = {
  id: string;
  name: string;
  city: string;
  whatsapp: string;
  skills: string[];
  brands: string[];
  reviews: Review[];
};

const riders = [
  { id: "rider1", name: "Ali Raza", city: "Lahore", whatsapp: "923001110001" },
  { id: "rider2", name: "Sara Khan", city: "Karachi", whatsapp: "923001110002" },
];

const providers: Provider[] = [
  {
    id: "detailer-lhr",
    name: "Shine Pro Detailing",
    city: "Lahore",
    whatsapp: "923002220001",
    skills: ["detailing", "bodywork_paint"],
    brands: ["Honda", "Kawasaki", "Yamaha"],
    reviews: [
      { riderId: "rider1", riderName: "Ali Raza", rating: 5, text: "Bike looked showroom new. Ceramic coat was worth it." },
      { riderId: "rider2", riderName: "Sara Khan", rating: 4, text: "Great work, took an hour longer than promised." },
      { riderId: "rider1", riderName: "Ali Raza", rating: 5, text: "Second time here. Same quality, fair price." },
    ],
  },
  {
    id: "tuner-lhr",
    name: "Usman Tuning Garage",
    city: "Lahore",
    whatsapp: "923002220002",
    skills: ["tuning", "engine"],
    brands: ["KTM", "Kawasaki", "Benelli"],
    reviews: [
      { riderId: "rider1", riderName: "Ali Raza", rating: 5, text: "Fixed the flat spot on my Duke 390 after two other shops failed." },
      { riderId: "rider2", riderName: "Sara Khan", rating: 4, text: "Knows ECUs well. Explains everything." },
    ],
  },
  {
    id: "general-lhr",
    name: "Bilal Motors",
    city: "Lahore",
    whatsapp: "923002220003",
    skills: ["general", "tyres", "electrical"],
    brands: ["Honda", "Yamaha", "Suzuki"],
    reviews: [
      { riderId: "rider1", riderName: "Ali Raza", rating: 4, text: "Wheel balancing done in 30 minutes. Honest pricing." },
      { riderId: "rider2", riderName: "Sara Khan", rating: 5, text: "Found a loose axle nut nobody else noticed." },
      { riderId: "rider1", riderName: "Ali Raza", rating: 4, text: "Quick oil change, no upselling." },
    ],
  },
  {
    id: "general-khi",
    name: "Karachi Bike Clinic",
    city: "Karachi",
    whatsapp: "923002220004",
    skills: ["general", "engine", "tyres"],
    brands: ["Honda", "Suzuki", "Kawasaki"],
    reviews: [
      { riderId: "rider2", riderName: "Sara Khan", rating: 5, text: "Full service on my Ninja 400, very professional." },
      { riderId: "rider1", riderName: "Ali Raza", rating: 3, text: "Good work but the shop was very busy." },
    ],
  },
  {
    id: "electric-khi",
    name: "Spark Auto Electric",
    city: "Karachi",
    whatsapp: "923002220005",
    skills: ["electrical", "modification"],
    brands: ["Yamaha", "KTM", "Honda"],
    reviews: [
      { riderId: "rider2", riderName: "Sara Khan", rating: 5, text: "Wired LED fog lights neatly with a proper relay." },
      { riderId: "rider1", riderName: "Ali Raza", rating: 4, text: "Sorted my charging issue in one visit." },
      { riderId: "rider2", riderName: "Sara Khan", rating: 5, text: "Fair price for a full rewire." },
      { riderId: "rider1", riderName: "Ali Raza", rating: 4, text: "Good advice on battery choice." },
    ],
  },
  {
    id: "detailer-isb",
    name: "Capital Detail Studio",
    city: "Islamabad",
    whatsapp: "923002220006",
    skills: ["detailing", "modification", "bodywork_paint"],
    brands: ["BMW", "Kawasaki", "Suzuki"],
    reviews: [
      { riderId: "rider1", riderName: "Ali Raza", rating: 5, text: "Paint correction on my Z900 was perfect." },
      { riderId: "rider2", riderName: "Sara Khan", rating: 4, text: "Nice wrap job, slightly pricey." },
    ],
  },
];

const storeOwners = [
  { id: "store1", name: "Hamza Siddiqui", city: "Lahore", whatsapp: "923003330001" },
  { id: "store2", name: "Faisal Iqbal", city: "Lahore", whatsapp: "923003330002" },
  { id: "store3", name: "Ayesha Malik", city: "Karachi", whatsapp: "923003330003" },
];

// ---------------------------------------------------------------- stores

const stores = [
  { id: "store1", name: "Hamza Superbike Parts", city: "Lahore", area: "McLeod Road", verified: true },
  { id: "store2", name: "Speed Zone Spares", city: "Lahore", area: "Gulberg", verified: true },
  { id: "store3", name: "Karachi Moto Hub", city: "Karachi", area: "Plaza Quarters", verified: false },
];

// ---------------------------------------------------------------- products

type SeedProduct = {
  store: string;
  name: string;
  partType: string;
  bikeKeys: string[];
  condition: "new_genuine" | "new_copy" | "used_genuine";
  price: number;
};

const products: SeedProduct[] = [
  // Demo moment: Part → Headlight, Ninja 400 shows matches from 2 stores, one a copy.
  { store: "store1", name: "Ninja 400 LED Headlight Assembly", partType: "headlight", bikeKeys: ["kawasaki-ninja400"], condition: "new_genuine", price: 38000 },
  { store: "store2", name: "Ninja 400 / 250 Headlight (Aftermarket)", partType: "headlight", bikeKeys: ["kawasaki-ninja400", "kawasaki-ninja250"], condition: "new_copy", price: 14500 },
  { store: "store1", name: "Ninja 400 Brake Pads (Front)", partType: "brake_pads", bikeKeys: ["kawasaki-ninja400", "kawasaki-ninja250"], condition: "new_genuine", price: 6500 },
  { store: "store1", name: "Duke 390 Chain & Sprocket Kit", partType: "chain_sprocket", bikeKeys: ["ktm-duke390", "ktm-rc390"], condition: "new_genuine", price: 22000 },
  { store: "store1", name: "CBR250RR Air Filter", partType: "air_filter", bikeKeys: ["honda-cbr250rr"], condition: "new_genuine", price: 4200 },
  { store: "store1", name: "Z900 Oil Filter", partType: "oil_filter", bikeKeys: ["kawasaki-z900", "kawasaki-ninja650"], condition: "new_genuine", price: 2800 },
  { store: "store1", name: "Hayabusa Mirrors (Pair)", partType: "mirrors", bikeKeys: ["suzuki-hayabusa"], condition: "used_genuine", price: 9000 },
  { store: "store1", name: "R15 V3 Tail Light", partType: "tail_light", bikeKeys: ["yamaha-r15"], condition: "new_genuine", price: 5500 },
  { store: "store2", name: "CBR150R Headlight", partType: "headlight", bikeKeys: ["honda-cbr150r"], condition: "new_copy", price: 7800 },
  { store: "store2", name: "Universal LED Indicators (Set of 4)", partType: "indicators", bikeKeys: ["honda-cbr150r", "yamaha-r15", "suzuki-gsxr150", "kawasaki-ninja250", "kawasaki-ninja400"], condition: "new_copy", price: 2500 },
  { store: "store2", name: "Ninja 650 Slip-on Exhaust", partType: "exhaust", bikeKeys: ["kawasaki-ninja650"], condition: "used_genuine", price: 45000 },
  { store: "store2", name: "R3 Brake Pads (Front + Rear)", partType: "brake_pads", bikeKeys: ["yamaha-r3"], condition: "new_genuine", price: 7200 },
  { store: "store2", name: "GSX-R150 Body Panel Set", partType: "body_panels", bikeKeys: ["suzuki-gsxr150"], condition: "new_copy", price: 18000 },
  { store: "store2", name: "12V Gel Battery (YTX7A)", partType: "battery", bikeKeys: ["honda-cbr150r", "yamaha-r15", "suzuki-gsxr150", "benelli-tnt150"], condition: "new_genuine", price: 8500 },
  { store: "store3", name: "Ninja 400 Headlight (Used, Original)", partType: "headlight", bikeKeys: ["kawasaki-ninja400"], condition: "used_genuine", price: 21000 },
  { store: "store3", name: "Pirelli Diablo Rosso Rear Tyre 150/60-17", partType: "tyre", bikeKeys: ["kawasaki-ninja400", "yamaha-r3", "ktm-rc390", "honda-cbr500r"], condition: "new_genuine", price: 32000 },
  { store: "store3", name: "TRK 502 Crash Guard Mirrors", partType: "mirrors", bikeKeys: ["benelli-trk502"], condition: "new_copy", price: 6000 },
  { store: "store3", name: "Duke 390 Air Filter", partType: "air_filter", bikeKeys: ["ktm-duke390"], condition: "new_genuine", price: 4800 },
  { store: "store3", name: "CB500X Chain Kit", partType: "chain_sprocket", bikeKeys: ["honda-cb500x", "honda-cbr500r"], condition: "new_genuine", price: 19500 },
  { store: "store3", name: "G 310 R Rear Brake Pads", partType: "brake_pads", bikeKeys: ["bmw-g310r"], condition: "new_genuine", price: 5200 },
];

// ---------------------------------------------------------------- community

type SeedReply = { author: string; text: string; upvotes: number };
type Thread = { id: string; author: string; bikeKey: string; bikeLabel: string; text: string; replies: SeedReply[] };

const threads: Thread[] = [
  {
    id: "q1", author: "rider1", bikeKey: "honda-cbr150r", bikeLabel: "Honda CBR150R 2019",
    text: "Engine noise at idle, a ticking sound that goes away when I rev. Is this the valves?",
    replies: [
      { author: "general-lhr", text: "Most likely valve clearance. It's a 1-hour job, around Rs. 2,000-3,000. Don't ignore it.", upvotes: 9 },
      { author: "rider2", text: "Mine did the same, it was a loose heat shield. Check that first, it's free.", upvotes: 4 },
    ],
  },
  {
    id: "q2", author: "rider2", bikeKey: "kawasaki-ninja400", bikeLabel: "Kawasaki Ninja 400 2021",
    text: "Which engine oil do you use in Lahore heat? 10W-40 or 15W-50?",
    replies: [
      { author: "tuner-lhr", text: "10W-40 fully synthetic is fine year round. Change every 3,000 km in summer.", upvotes: 7 },
      { author: "rider1", text: "I run 10W-40 Motul, no issues in 45°C.", upvotes: 3 },
    ],
  },
  {
    id: "q3", author: "rider1", bikeKey: "ktm-duke390", bikeLabel: "KTM 390 Duke 2020",
    text: "Bike jerks at low rpm in 2nd gear in traffic. Is this normal for the Duke?",
    replies: [
      { author: "tuner-lhr", text: "Common on the 390. Chain slack and a throttle body clean fix most of it. An ECU flash fixes the rest.", upvotes: 11 },
    ],
  },
  {
    id: "q4", author: "rider2", bikeKey: "yamaha-r15", bikeLabel: "Yamaha R15 V3 2022",
    text: "How often should I replace the chain and sprocket kit?",
    replies: [
      { author: "general-khi", text: "Every 15,000-20,000 km if you clean and lube it every 500 km. Always change the full kit together.", upvotes: 6 },
      { author: "store3", text: "We stock genuine kits for R15 and Duke. Happy to check fitment.", upvotes: 1 },
    ],
  },
  {
    id: "q5", author: "rider1", bikeKey: "kawasaki-ninja400", bikeLabel: "Kawasaki Ninja 400 2020",
    text: "Headlight flickers on low beam after rain. Wiring or bulb?",
    replies: [
      { author: "electric-khi", text: "Usually water in the connector behind the headlight. Dry it, add dielectric grease. If it continues, check the ground wire.", upvotes: 8 },
    ],
  },
  {
    id: "q6", author: "rider2", bikeKey: "suzuki-gsxr150", bikeLabel: "Suzuki GSX-R150 2021",
    text: "Is the copy body kit worth it or should I wait for genuine panels?",
    replies: [
      { author: "detailer-isb", text: "Copy kits fit about 90%. Fine for daily riding; for resale value go genuine.", upvotes: 5 },
      { author: "rider1", text: "My copy kit cracked at the mount points after 6 months.", upvotes: 4 },
    ],
  },
  {
    id: "q7", author: "rider1", bikeKey: "honda-cbr250rr", bikeLabel: "Honda CBR250RR 2022",
    text: "Best place in Lahore for ceramic coating? Prices I'm getting vary a lot.",
    replies: [
      { author: "detailer-lhr", text: "A proper 2-layer ceramic coat with paint correction is Rs. 18,000-25,000. Below that, ask what product they use.", upvotes: 6 },
    ],
  },
  {
    id: "q8", author: "rider2", bikeKey: "benelli-trk502", bikeLabel: "Benelli TRK 502 2021",
    text: "Planning a trip to Skardu. What should I service before going?",
    replies: [
      { author: "general-khi", text: "Brake pads, chain kit, tyres, oil + filter, and carry a spare clutch cable. Check spoke tension too.", upvotes: 10 },
      { author: "rider1", text: "Carry a puncture kit and a small pump. Shops are far apart after Chilas.", upvotes: 7 },
    ],
  },
  {
    id: "q9", author: "rider1", bikeKey: "kawasaki-z900", bikeLabel: "Kawasaki Z900 2019",
    text: "Vibration in the handlebars above 120 km/h. Wheel balancing or something else?",
    replies: [
      { author: "general-lhr", text: "Start with wheel balancing and check the front axle nut torque. 30 minutes, about Rs. 500-800.", upvotes: 8 },
    ],
  },
  {
    id: "q10", author: "rider2", bikeKey: "yamaha-r3", bikeLabel: "Yamaha R3 2020",
    text: "Battery dies if I don't ride for a week. Normal?",
    replies: [
      { author: "electric-khi", text: "Not normal. Test for parasitic drain; an aftermarket alarm or USB charger is often the cause.", upvotes: 6 },
      { author: "store2", text: "If the battery is over 3 years old, a fresh gel battery usually fixes it.", upvotes: 2 },
    ],
  },
];

// ---------------------------------------------------------------- helpers

const everyone = new Map<string, { name: string; role: "rider" | "provider" | "store_owner" }>();
riders.forEach((u) => everyone.set(u.id, { name: u.name, role: "rider" }));
providers.forEach((u) => everyone.set(u.id, { name: u.name, role: "provider" }));
storeOwners.forEach((u) => everyone.set(u.id, { name: u.name, role: "store_owner" }));

function person(id: string) {
  const p = everyone.get(id);
  if (!p) throw new Error(`Unknown seed user: ${id}`);
  return p;
}

/** Firestore batches hold 500 writes; this flushes automatically. */
class Writer {
  private batch: WriteBatch = db.batch();
  private count = 0;
  total = 0;
  async set(path: string, data: Record<string, unknown>) {
    this.batch.set(db.doc(path), data);
    this.count++;
    this.total++;
    if (this.count >= 450) await this.flush();
  }
  async flush() {
    if (this.count === 0) return;
    await this.batch.commit();
    this.batch = db.batch();
    this.count = 0;
  }
}

// ---------------------------------------------------------------- write

async function main() {
  const w = new Writer();

  await w.set("config/pricing", { approvedRequestFee: 150, storeMonthlyFee: 2000, productFee: 50 });

  for (const r of riders) {
    await w.set(`users/${r.id}`, { name: r.name, photoURL: "", city: r.city, whatsapp: r.whatsapp, role: "rider" });
  }

  for (const p of providers) {
    const total = p.reviews.reduce((sum, r) => sum + r.rating, 0);
    const rating = Math.round((total / p.reviews.length) * 10) / 10;
    await w.set(`users/${p.id}`, {
      name: p.name,
      photoURL: "",
      city: p.city,
      whatsapp: p.whatsapp,
      role: "provider",
      skills: p.skills,
      brands: p.brands,
      portfolio: [],
      rating,
      ratingCount: p.reviews.length,
    });
    for (const [i, r] of p.reviews.entries()) {
      await w.set(`users/${p.id}/reviews/${p.id}-r${i + 1}`, { ...r, createdAt: minutesAgo(60 * 24 * (i + 2)) });
    }
  }

  for (const o of storeOwners) {
    await w.set(`users/${o.id}`, { name: o.name, photoURL: "", city: o.city, whatsapp: o.whatsapp, role: "store_owner" });
  }

  for (const s of stores) {
    const owner = storeOwners.find((o) => o.id === s.id)!;
    await w.set(`stores/${s.id}`, {
      ownerId: s.id,
      name: s.name,
      city: s.city,
      area: s.area,
      logoURL: "",
      whatsapp: owner.whatsapp,
      verified: s.verified,
      createdAt: minutesAgo(60 * 24 * 3),
    });
  }

  for (const [i, p] of products.entries()) {
    const store = stores.find((s) => s.id === p.store)!;
    const owner = storeOwners.find((o) => o.id === p.store)!;
    await w.set(`products/p${String(i + 1).padStart(2, "0")}`, {
      storeId: store.id,
      storeName: store.name,
      city: store.city,
      whatsapp: owner.whatsapp,
      name: p.name,
      partType: p.partType,
      bikeKeys: p.bikeKeys,
      condition: p.condition,
      price: p.price,
      photos: [],
      status: "active",
      createdAt: minutesAgo(30 + i * 7),
    });
  }

  for (const [i, t] of threads.entries()) {
    const author = person(t.author);
    const authorCity = riders.find((r) => r.id === t.author)?.city ?? "Lahore";
    await w.set(`posts/${t.id}`, {
      authorId: t.author,
      authorName: author.name,
      city: authorCity,
      bikeKey: t.bikeKey,
      bikeLabel: t.bikeLabel,
      type: "question",
      skill: null,
      partType: null,
      text: t.text,
      photos: [],
      status: "open",
      approvedOfferId: null,
      upvotes: 0,
      replyCount: t.replies.length,
      createdAt: minutesAgo(60 * (i + 1) * 5),
    });
    for (const [j, r] of t.replies.entries()) {
      const p = person(r.author);
      await w.set(`posts/${t.id}/replies/${t.id}-r${j + 1}`, {
        authorId: r.author,
        authorName: p.name,
        role: p.role,
        text: r.text,
        upvotes: r.upvotes,
        createdAt: minutesAgo(60 * (i + 1) * 5 - (j + 1) * 20),
      });
    }
  }

  // One open part request and one open service request, so the store inbox
  // and the provider inbox both have something on a fresh project.
  await w.set("posts/part-req1", {
    authorId: "rider1",
    authorName: "Ali Raza",
    city: "Lahore",
    bikeKey: "kawasaki-ninja400",
    bikeLabel: "Kawasaki Ninja 400 2020",
    type: "part",
    skill: null,
    partType: "headlight",
    text: "Need a headlight for my Ninja 400, the old one cracked. Genuine preferred.",
    photos: [],
    status: "open",
    approvedOfferId: null,
    upvotes: 0,
    replyCount: 0,
    createdAt: minutesAgo(15),
  });
  await w.set("posts/service-req1", {
    authorId: "rider2",
    authorName: "Sara Khan",
    city: "Lahore",
    bikeKey: "honda-cbr250rr",
    bikeLabel: "Honda CBR250RR 2022",
    type: "service",
    skill: "detailing",
    partType: null,
    text: "Full detailing and a wax before a weekend ride to Murree.",
    photos: [],
    status: "open",
    approvedOfferId: null,
    upvotes: 0,
    replyCount: 0,
    createdAt: minutesAgo(25),
  });

  await w.flush();
  console.log(
    `Seeded ${w.total} documents: ${riders.length} riders, ${providers.length} providers, ` +
      `${stores.length} stores, ${products.length} products, ${threads.length} threads, config/pricing.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
