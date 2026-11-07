"use client";

// Part B owns this file: the community feed (Shared Contract → B6).

import { useState } from "react";
import Link from "next/link";
import { collection, limit, orderBy, query, where, type QueryConstraint } from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import type { Post } from "@/lib/types";
import { BIKES, bikeLabel } from "@/lib/bikes";
import { timeAgo } from "@/components/store/format";
import { useLiveQuery } from "@/components/store/live";
import { Empty, ErrorNote, btnPrimary, inputCls } from "@/components/store/ui";

export default function CommunityFeed() {
  const { authUser } = useUser();
  const [bikeKey, setBikeKey] = useState("");

  const { docs, loading, error } = useLiveQuery<Post>(`feed:${bikeKey}`, () => {
    const filters: QueryConstraint[] = [where("type", "==", "question")];
    if (bikeKey) filters.push(where("bikeKey", "==", bikeKey));
    return query(collection(db, "posts"), ...filters, orderBy("createdAt", "desc"), limit(50));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Community</h1>
          <p className="text-sm text-foreground/70">Questions from riders, answered by riders and mechanics.</p>
        </div>
        {authUser ? (
          <Link href="/post/new" className={btnPrimary}>
            Ask a question
          </Link>
        ) : null}
      </div>

      <select
        className={`${inputCls} sm:max-w-xs`}
        value={bikeKey}
        onChange={(e) => setBikeKey(e.target.value)}
        aria-label="Filter by bike"
      >
        <option value="">All bikes</option>
        {BIKES.map((b) => (
          <option key={b.key} value={b.key}>
            {b.label}
          </option>
        ))}
      </select>

      <ErrorNote message={error} />

      {loading ? (
        <p className="text-sm text-foreground/60">Loading questions…</p>
      ) : docs.length === 0 && !error ? (
        <Empty>
          {bikeKey ? `No questions about the ${bikeLabel(bikeKey)} yet.` : "No questions yet."}{" "}
          {authUser ? "Ask the first one." : "Sign in to ask the first one."}
        </Empty>
      ) : (
        <ul className="space-y-3">
          {docs.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="block rounded-lg border border-black/10 p-4 hover:border-orange-600/50 hover:bg-orange-600/[0.03] dark:border-white/10"
              >
                <p className="font-medium leading-snug">{post.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/60">
                  <span className="rounded bg-black/5 px-1.5 py-0.5 font-medium text-foreground/80 dark:bg-white/10">
                    {post.bikeLabel || bikeLabel(post.bikeKey)}
                  </span>
                  <span>
                    {post.authorName} · {post.city}
                  </span>
                  <span>{timeAgo(post.createdAt)}</span>
                  <span className="ml-auto font-medium text-foreground/80">
                    {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
