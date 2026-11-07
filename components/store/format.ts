// Small formatting helpers shared by Part B components.

import type { Timestamp } from "firebase/firestore";

export function formatRs(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}

/** wa.me link with a pre-filled message. `phone` is digits only, e.g. "923001234567". */
export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function timeAgo(ts: Timestamp | null | undefined): string {
  if (!ts) return "just now";
  const seconds = Math.max(0, Math.floor((Date.now() - ts.toMillis()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return ts.toDate().toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}
