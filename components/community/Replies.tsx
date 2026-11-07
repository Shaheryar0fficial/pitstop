"use client";

// Integration component (Shared Contract). Part A places it on posts/[id]
// when type is "part" or "question". Reads and writes Firestore itself.

import { useState } from "react";
import Link from "next/link";
import {
  collection,
  doc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import type { Product, Reply } from "@/lib/store-types";
import ProductCard from "@/components/store/ProductCard";
import { timeAgo } from "@/components/store/format";
import { useLiveDoc, useLiveQuery } from "@/components/store/live";
import { Empty, ErrorNote, btnPrimary, inputCls } from "@/components/store/ui";

export function Replies({ postId, allowProductSuggest }: { postId: string; allowProductSuggest: boolean }) {
  const { authUser, profile } = useUser();
  const replies = useLiveQuery<Reply>(postId ? `replies:${postId}` : null, () =>
    query(collection(db, "posts", postId, "replies"), orderBy("upvotes", "desc")),
  );
  // Upvotes are once per reply per visit (blocking repeat votes for good is
  // listed under "Skipped for now" in the plan).
  const [voted, setVoted] = useState<Set<string>>(() => new Set());

  // Most upvotes first; older first on a tie, so the conversation reads in order.
  const list = [...replies.docs].sort(
    (a, b) => b.upvotes - a.upvotes || (a.createdAt?.toMillis() ?? Infinity) - (b.createdAt?.toMillis() ?? Infinity),
  );
  const topId = list[0] && list[0].upvotes > 0 ? list[0].id : null;

  async function upvote(replyId: string) {
    if (!authUser || voted.has(replyId)) return;
    setVoted((s) => new Set(s).add(replyId));
    try {
      await updateDoc(doc(db, "posts", postId, "replies", replyId), { upvotes: increment(1) });
    } catch (e) {
      setVoted((s) => {
        const next = new Set(s);
        next.delete(replyId);
        return next;
      });
      alert(`Couldn't upvote: ${(e as Error).message}`);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        {list.length ? `${list.length} ${list.length === 1 ? "reply" : "replies"}` : "Replies"}
      </h2>

      <ErrorNote message={replies.error} />

      {replies.loading ? (
        <p className="text-sm text-foreground/60">Loading replies…</p>
      ) : list.length === 0 && !replies.error ? (
        <Empty>No replies yet. Be the first to help.</Empty>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => (
            <li
              key={r.id}
              className={`rounded-lg border p-4 ${
                r.id === topId ? "border-green-600/40 bg-green-600/[0.04]" : "border-black/10 dark:border-white/10"
              }`}
            >
              <div className="flex gap-3">
                <button
                  onClick={() => upvote(r.id)}
                  disabled={!authUser || voted.has(r.id)}
                  title={authUser ? "Upvote this reply" : "Sign in to upvote"}
                  className="flex h-fit min-w-10 flex-col items-center rounded-md border border-black/10 px-2 py-1 text-xs hover:border-orange-600 disabled:cursor-default disabled:hover:border-black/10 dark:border-white/10"
                >
                  <span className={voted.has(r.id) ? "text-orange-600" : ""}>▲</span>
                  <span className="font-semibold">{r.upvotes}</span>
                </button>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <AuthorName reply={r} />
                    {r.role === "provider" ? (
                      <span className="rounded bg-orange-600 px-1.5 py-0.5 text-xs font-medium text-white">Mechanic</span>
                    ) : r.role === "store_owner" ? (
                      <span className="rounded bg-sky-600 px-1.5 py-0.5 text-xs font-medium text-white">Store</span>
                    ) : null}
                    {r.id === topId ? (
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">Top answer</span>
                    ) : null}
                    <span className="text-xs text-foreground/60">{timeAgo(r.createdAt)}</span>
                  </div>
                  {r.text ? <p className="whitespace-pre-line text-sm text-foreground/85">{r.text}</p> : null}
                  {r.productId ? <SuggestedProduct productId={r.productId} /> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {authUser && profile ? (
        <ReplyBox
          postId={postId}
          uid={authUser.uid}
          name={profile.name}
          role={profile.role}
          canSuggest={allowProductSuggest && profile.role === "store_owner"}
        />
      ) : authUser ? null : (
        <p className="text-sm text-foreground/60">Sign in with Google to reply.</p>
      )}
    </section>
  );
}

function AuthorName({ reply }: { reply: Reply }) {
  const href =
    reply.role === "provider" ? `/providers/${reply.authorId}` : reply.role === "store_owner" ? `/stores/${reply.authorId}` : null;
  return href ? (
    <Link href={href} className="font-medium hover:underline">
      {reply.authorName}
    </Link>
  ) : (
    <span className="font-medium">{reply.authorName}</span>
  );
}

function SuggestedProduct({ productId }: { productId: string }) {
  const { data, loading } = useLiveDoc<Product>(`product:${productId}`, () => doc(db, "products", productId));
  if (loading) return <p className="text-xs text-foreground/60">Loading suggested product…</p>;
  if (!data) return <p className="text-xs text-foreground/60">The suggested product is no longer listed.</p>;
  return (
    <div className="max-w-xs">
      <p className="mb-1 text-xs font-medium text-foreground/60">Suggested product</p>
      <ProductCard product={data} />
    </div>
  );
}

function ReplyBox({
  postId,
  uid,
  name,
  role,
  canSuggest,
}: {
  postId: string;
  uid: string;
  name: string;
  role: Reply["role"];
  canSuggest: boolean;
}) {
  const [text, setText] = useState("");
  const [productId, setProductId] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const myProducts = useLiveQuery<Product>(canSuggest ? `my-active-products:${uid}` : null, () =>
    query(collection(db, "products"), where("storeId", "==", uid), where("status", "==", "active")),
  );

  const body = text.trim() || (productId ? "I have this part in stock." : "");

  async function send() {
    if (!body) return;
    setSending(true);
    setError("");
    try {
      // The reply and the post's replyCount land together.
      const batch = writeBatch(db);
      const replyRef = doc(collection(db, "posts", postId, "replies"));
      batch.set(replyRef, {
        authorId: uid,
        authorName: name,
        role,
        text: body,
        upvotes: 0,
        ...(productId ? { productId } : {}),
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, "posts", postId), { replyCount: increment(1) });
      await batch.commit();
      setText("");
      setProductId("");
    } catch (e) {
      setError(`Couldn't post your reply: ${(e as Error).message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
      {canSuggest ? (
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="suggest-product">
            Suggest one of your products <span className="font-normal text-foreground/60">(free)</span>
          </label>
          <select id="suggest-product" className={inputCls} value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">No product, just a reply</option>
            {myProducts.docs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · Rs. {p.price.toLocaleString("en-PK")}
              </option>
            ))}
          </select>
          {!myProducts.loading && myProducts.docs.length === 0 ? (
            <p className="text-xs text-foreground/60">
              You have no active products.{" "}
              <Link href="/products/new" className="underline">
                Add one
              </Link>
              .
            </p>
          ) : null}
        </div>
      ) : null}
      <textarea
        className={`${inputCls} min-h-24`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={canSuggest ? "Add a note for the rider (optional with a product)" : "Share what you know…"}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className={btnPrimary} onClick={send} disabled={sending || !body}>
        {sending ? "Posting…" : productId ? "Suggest product" : "Post reply"}
      </button>
    </div>
  );
}

export default Replies;
