// Shared types that mirror the Data Model in the Shared Contract.
// Owned by Part A. If a field changes here, tell Part B.

import type { Timestamp } from "firebase/firestore";

export type Role = "rider" | "provider" | "store_owner";

export const ROLES: { key: Role; label: string; blurb: string }[] = [
  { key: "rider", label: "Rider", blurb: "I own a bike and need services, parts, or advice" },
  { key: "provider", label: "Service Provider", blurb: "I'm a mechanic, detailer, tuner, or modifier" },
  { key: "store_owner", label: "Store Owner", blurb: "I sell bike parts" },
];

export const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
] as const;

export const BRANDS = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "KTM", "Benelli", "Other"] as const;

export interface UserProfile {
  uid: string;
  name: string;
  photoURL: string;
  city: string;
  whatsapp: string; // digits only, e.g. "923001234567"
  role: Role;
  // providers only
  skills?: string[];
  brands?: string[];
  portfolio?: string[];
  rating?: number;
  ratingCount?: number;
}

export type PostType = "service" | "part" | "question";
export type PostStatus = "open" | "assigned" | "closed";

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  city: string;
  bikeKey: string;
  bikeLabel: string;
  type: PostType;
  skill: string | null;
  partType: string | null;
  text: string;
  photos: string[];
  status: PostStatus;
  approvedOfferId: string | null;
  upvotes: number;
  replyCount: number;
  createdAt: Timestamp | null;
}

export type OfferStatus = "pending" | "approved" | "declined";

export interface Offer {
  id: string;
  postId: string;
  postAuthorId: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  message: string;
  priceEstimate: number;
  when: string;
  status: OfferStatus;
  createdAt: Timestamp | null;
  approvedAt: Timestamp | null;
}

/** Turns "0300 1234567" or "+92 300 1234567" into "923001234567" for wa.me links. */
export function normalizeWhatsapp(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  return digits;
}
