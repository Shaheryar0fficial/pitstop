/* eslint-disable @next/next/no-img-element -- store logo from a Firebase Storage URL */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, query, updateDoc, where } from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import type { Product, Store } from "@/lib/store-types";
import ProductCard from "@/components/store/ProductCard";
import { whatsappLink } from "@/components/store/format";
import { useLiveDoc, useLiveQuery } from "@/components/store/live";
import { Empty, ErrorNote, Gate, btnPrimary, btnSecondary, btnWhatsapp } from "@/components/store/ui";

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const { authUser } = useUser();
  const store = useLiveDoc<Store>(id ? `store:${id}` : null, () => doc(db, "stores", id));
  // All of this store's products; sold ones are shown only to the owner.
  const products = useLiveQuery<Product>(id ? `store-products:${id}` : null, () =>
    query(collection(db, "products"), where("storeId", "==", id)),
  );

  if (store.loading) return <p className="py-10 text-sm text-foreground/60">Loading store…</p>;
  if (!store.data) return <Gate title="Store not found" href="/parts" cta="Browse parts" />;

  const s = store.data;
  const isOwner = authUser?.uid === s.ownerId;
  const list = products.docs
    .filter((p) => isOwner || p.status === "active")
    .sort((a, b) => (b.createdAt?.toMillis() ?? Infinity) - (a.createdAt?.toMillis() ?? Infinity));
  const activeCount = products.docs.filter((p) => p.status === "active").length;

  async function markSold(productId: string) {
    if (!confirm("Mark this product as sold? It will stop showing to riders.")) return;
    try {
      await updateDoc(doc(db, "products", productId), { status: "sold" });
    } catch (e) {
      alert(`Couldn't update the product: ${(e as Error).message}`);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-lg border border-black/10 p-4 sm:flex-row sm:items-center dark:border-white/10">
        {s.logoURL ? (
          <img src={s.logoURL} alt={`${s.name} logo`} className="h-16 w-16 rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-600 text-2xl font-bold text-white">
            {s.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{s.name}</h1>
            {s.verified ? (
              <span className="rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                ✓ Verified store
              </span>
            ) : (
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-foreground/70 dark:bg-white/10">
                Listed on PitStop
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/70">
            {s.area}, {s.city} · {activeCount} active {activeCount === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwner ? (
            <>
              <Link href="/products/new" className={btnPrimary}>
                Add product
              </Link>
              <Link href="/stores/new" className={btnSecondary}>
                Edit store
              </Link>
              <Link href="/billing" className={btnSecondary}>
                Billing
              </Link>
            </>
          ) : s.whatsapp ? (
            <a href={whatsappLink(s.whatsapp, `Hi, I found ${s.name} on PitStop.`)} target="_blank" rel="noreferrer" className={btnWhatsapp}>
              WhatsApp store
            </a>
          ) : null}
        </div>
      </header>

      <ErrorNote message={products.error} />

      {products.loading ? (
        <p className="text-sm text-foreground/60">Loading products…</p>
      ) : list.length === 0 ? (
        <Empty>{isOwner ? "No products yet. Add your first one." : "This store has no products listed right now."}</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} onMarkSold={isOwner ? () => markSold(p.id) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
