// Part B owns this file. Store owner billing (Shared Contract → Revenue):
//   storeMonthlyFee + (products listed this month × productFee)
// Worked out from data that already exists, with a Firestore count() query.

import { Timestamp, collection, doc, getCountFromServer, getDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_PRICING, type Pricing } from "./store-types";

export async function getPricing(): Promise<Pricing> {
  try {
    const snap = await getDoc(doc(db, "config", "pricing"));
    return snap.exists() ? { ...DEFAULT_PRICING, ...(snap.data() as Partial<Pricing>) } : DEFAULT_PRICING;
  } catch {
    return DEFAULT_PRICING;
  }
}

export function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export interface StoreBillData {
  hasStore: boolean;
  storeMonthlyFee: number;
  productFee: number;
  productsThisMonth: number;
  total: number;
  monthLabel: string;
}

export async function getStoreBill(uid: string): Promise<StoreBillData> {
  const monthStart = startOfMonth();
  const [pricing, storeSnap, countSnap] = await Promise.all([
    getPricing(),
    getDoc(doc(db, "stores", uid)),
    getCountFromServer(
      query(
        collection(db, "products"),
        where("storeId", "==", uid),
        where("createdAt", ">=", Timestamp.fromDate(monthStart)),
      ),
    ),
  ]);

  const hasStore = storeSnap.exists();
  const productsThisMonth = countSnap.data().count;
  const storeFee = hasStore ? pricing.storeMonthlyFee : 0;

  return {
    hasStore,
    storeMonthlyFee: storeFee,
    productFee: pricing.productFee,
    productsThisMonth,
    total: storeFee + productsThisMonth * pricing.productFee,
    monthLabel: monthStart.toLocaleDateString("en-PK", { month: "long", year: "numeric" }),
  };
}
