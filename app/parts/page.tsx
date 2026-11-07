"use client";

import { useState } from "react";
import Link from "next/link";
import { collection, limit, query, where, type QueryConstraint } from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import { BIKES } from "@/lib/bikes";
import { PART_TYPES } from "@/lib/partTypes";
import type { Product } from "@/lib/store-types";
import ProductCard from "@/components/store/ProductCard";
import { useLiveQuery } from "@/components/store/live";
import { Empty, ErrorNote, btnSecondary, inputCls } from "@/components/store/ui";

export default function PartsPage() {
  const { profile } = useUser();
  const [bikeKey, setBikeKey] = useState("");
  const [partType, setPartType] = useState("");

  const { docs, loading, error } = useLiveQuery<Product>(`parts:${bikeKey}:${partType}`, () => {
    const filters: QueryConstraint[] = [where("status", "==", "active")];
    if (bikeKey) filters.push(where("bikeKeys", "array-contains", bikeKey));
    if (partType) filters.push(where("partType", "==", partType));
    return query(collection(db, "products"), ...filters, limit(60));
  });

  const products = [...docs].sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Parts</h1>
          <p className="text-sm text-foreground/70">Genuine, copy and used parts from stores across Pakistan.</p>
        </div>
        {profile?.role === "store_owner" ? (
          <div className="flex gap-2">
            <Link href={`/stores/${profile.uid}`} className={btnSecondary}>
              My store
            </Link>
            <Link href="/products/new" className={btnSecondary}>
              + Add a product
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select className={inputCls} value={bikeKey} onChange={(e) => setBikeKey(e.target.value)} aria-label="Bike">
          <option value="">All bikes</option>
          {BIKES.map((b) => (
            <option key={b.key} value={b.key}>
              {b.label}
            </option>
          ))}
        </select>
        <select className={inputCls} value={partType} onChange={(e) => setPartType(e.target.value)} aria-label="Part type">
          <option value="">All part types</option>
          {PART_TYPES.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <ErrorNote message={error} />

      {loading ? (
        <p className="text-sm text-foreground/60">Loading parts…</p>
      ) : products.length === 0 && !error ? (
        <Empty>
          No parts match these filters yet.{" "}
          {profile?.role === "rider" ? (
            <Link href="/post/new" className="font-medium text-orange-700 underline dark:text-orange-400">
              Post a part request
            </Link>
          ) : null}
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} bikeKey={bikeKey || undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
