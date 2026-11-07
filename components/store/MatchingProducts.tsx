"use client";

// Integration component (Shared Contract). Part A places it on posts/[id]
// when type == "part". Reads Firestore itself from its props.

import { collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { bikeLabel } from "@/lib/bikes";
import { partTypeLabel } from "@/lib/partTypes";
import type { Product } from "@/lib/store-types";
import ProductCard from "./ProductCard";
import { useLiveQuery } from "./live";
import { Empty, ErrorNote } from "./ui";

export function MatchingProducts({ bikeKey, partType }: { bikeKey: string; partType: string }) {
  const { docs, loading, error } = useLiveQuery<Product>(
    bikeKey && partType ? `match:${bikeKey}:${partType}` : null,
    () =>
      query(
        collection(db, "products"),
        where("bikeKeys", "array-contains", bikeKey),
        where("partType", "==", partType),
        where("status", "==", "active"),
      ),
  );

  // Cheapest first; genuine before copy at the same price.
  const products = [...docs].sort((a, b) => a.price - b.price);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">
        Matching products{" "}
        <span className="text-sm font-normal text-foreground/60">
          {partTypeLabel(partType)} for {bikeLabel(bikeKey)}
          {!loading && products.length ? ` · ${products.length} found` : ""}
        </span>
      </h2>
      <ErrorNote message={error} />
      {loading ? (
        <p className="text-sm text-foreground/60">Looking for matching parts…</p>
      ) : products.length === 0 && !error ? (
        <Empty>No matching products yet. Every store on PitStop can see this request and suggest a part.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} bikeKey={bikeKey} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MatchingProducts;
