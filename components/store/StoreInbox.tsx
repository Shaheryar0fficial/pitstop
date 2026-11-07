"use client";

// Integration component (Shared Contract). Part A places it on /inbox when
// role == "store_owner". Live list of open part requests from every city.

import Link from "next/link";
import { collection, doc, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post } from "@/lib/types";
import { bikeLabel } from "@/lib/bikes";
import { partTypeLabel } from "@/lib/partTypes";
import type { Product, Store } from "@/lib/store-types";
import { timeAgo } from "./format";
import { useLiveDoc, useLiveQuery } from "./live";
import { Empty, ErrorNote, btnPrimary } from "./ui";

export function StoreInbox({ uid }: { uid: string }) {
  const requests = useLiveQuery<Post>(uid ? "store-inbox" : null, () =>
    query(
      collection(db, "posts"),
      where("type", "==", "part"),
      where("status", "==", "open"),
      orderBy("createdAt", "desc"),
      limit(50),
    ),
  );
  const store = useLiveDoc<Store>(uid ? `store:${uid}` : null, () => doc(db, "stores", uid));
  const mine = useLiveQuery<Product>(uid ? `my-active-products:${uid}` : null, () =>
    query(collection(db, "products"), where("storeId", "==", uid), where("status", "==", "active")),
  );

  const matchesFor = (post: Post) =>
    mine.docs.filter((p) => p.partType === post.partType && p.bikeKeys.includes(post.bikeKey)).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">
          Part requests{" "}
          {!requests.loading ? (
            <span className="text-sm font-normal text-foreground/60">· {requests.docs.length} open</span>
          ) : null}
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-foreground/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Live
        </span>
      </div>

      {!store.loading && !store.data ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-orange-600/30 bg-orange-600/5 p-3 text-sm">
          <span>Open your store so you can suggest your products on these requests.</span>
          <Link href="/stores/new" className={btnPrimary}>
            Open my store
          </Link>
        </div>
      ) : null}

      <ErrorNote message={requests.error} />

      {requests.loading ? (
        <p className="text-sm text-foreground/60">Loading requests…</p>
      ) : requests.docs.length === 0 && !requests.error ? (
        <Empty>No open part requests right now. New ones appear here instantly.</Empty>
      ) : (
        <ul className="space-y-3">
          {requests.docs.map((post) => {
            const matches = matchesFor(post);
            return (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="block rounded-lg border border-black/10 p-4 hover:border-orange-600/50 hover:bg-orange-600/[0.03] dark:border-white/10"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded bg-orange-600/10 px-1.5 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-400">
                      {partTypeLabel(post.partType)}
                    </span>
                    <span className="font-medium">{post.bikeLabel || bikeLabel(post.bikeKey)}</span>
                    <span className="text-foreground/60">
                      · {post.city} · {timeAgo(post.createdAt)}
                    </span>
                    {matches > 0 ? (
                      <span className="ml-auto rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        {matches} of your products {matches === 1 ? "matches" : "match"}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-foreground/80">{post.text}</p>
                  <p className="mt-2 text-xs text-foreground/60">
                    From {post.authorName} · Open the request to suggest a product (free)
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default StoreInbox;
