// Part B types for stores, products, replies and pricing.
// They mirror the Data Model in the Shared Contract. Shared types (users,
// posts, offers) live in lib/types.ts, which Part A owns.

import type { Timestamp } from "firebase/firestore";
import type { Role } from "./types";

export type ProductCondition = "new_genuine" | "new_copy" | "used_genuine";
export type ProductStatus = "active" | "sold";

export const CONDITIONS: { key: ProductCondition; label: string }[] = [
  { key: "new_genuine", label: "New – Genuine" },
  { key: "new_copy", label: "New – Copy" },
  { key: "used_genuine", label: "Used – Genuine" },
];

export function conditionLabel(key: string): string {
  return CONDITIONS.find((c) => c.key === key)?.label ?? key;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  city: string;
  area: string;
  logoURL: string;
  whatsapp: string;
  verified: boolean;
  createdAt: Timestamp | null;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  city: string;
  whatsapp: string;
  name: string;
  partType: string;
  bikeKeys: string[];
  condition: ProductCondition;
  price: number;
  photos: string[];
  status: ProductStatus;
  createdAt: Timestamp | null;
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  role: Role;
  text: string;
  upvotes: number;
  productId?: string;
  createdAt: Timestamp | null;
}

export interface Pricing {
  approvedRequestFee: number;
  storeMonthlyFee: number;
  productFee: number;
}

/** Used when config/pricing hasn't been seeded yet. */
export const DEFAULT_PRICING: Pricing = { approvedRequestFee: 150, storeMonthlyFee: 2000, productFee: 50 };
