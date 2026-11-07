// Provider billing (Part A). Worked out from existing data with a count()
// query, so there's no separate billing ledger to keep in sync.

import { Timestamp, collection, doc, getCountFromServer, getDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

export interface Pricing {
  approvedRequestFee: number;
  storeMonthlyFee: number;
  productFee: number;
}

/** Used when config/pricing hasn't been seeded yet. */
export const DEFAULT_PRICING: Pricing = { approvedRequestFee: 150, storeMonthlyFee: 2000, productFee: 50 };

export async function getPricing(): Promise<Pricing> {
  const snap = await getDoc(doc(db, "config", "pricing"));
  return snap.exists() ? { ...DEFAULT_PRICING, ...(snap.data() as Partial<Pricing>) } : DEFAULT_PRICING;
}

export function startOfThisMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export interface ProviderBill {
  approvedCount: number;
  fee: number;
  total: number;
  monthLabel: string;
}

export async function getProviderBill(uid: string): Promise<ProviderBill> {
  const monthStart = startOfThisMonth();
  const [pricing, count] = await Promise.all([
    getPricing(),
    getCountFromServer(
      query(
        collection(db, "offers"),
        where("providerId", "==", uid),
        where("status", "==", "approved"),
        where("approvedAt", ">=", Timestamp.fromDate(monthStart)),
      ),
    ),
  ]);
  const approvedCount = count.data().count;
  return {
    approvedCount,
    fee: pricing.approvedRequestFee,
    total: approvedCount * pricing.approvedRequestFee,
    monthLabel: monthStart.toLocaleString("en-US", { month: "long", year: "numeric" }),
  };
}
