"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import { skillLabel } from "@/lib/skills";
import { partTypeLabel } from "@/lib/partTypes";
import type { Post } from "@/lib/types";
import { MatchingProducts, Replies } from "@/components/shell/placeholders";
import { Badge, Card, timeAgo } from "@/components/shell/ui";
import RiderOffers from "@/components/provider/RiderOffers";
import ProviderOffer from "@/components/provider/ProviderOffer";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const { loading, profile } = useUser();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  // Live, so "Assigned" shows on every open screen the moment the rider approves.
  useEffect(() => {
    return onSnapshot(
      doc(db, "posts", id),
      (snap) => setPost(snap.exists() ? ({ id: snap.id, ...snap.data() } as Post) : null),
      () => setPost(null),
    );
  }, [id]);

  if (post === undefined || loading) return <p className="text-foreground/60">Loading…</p>;
  if (post === null) return <p className="py-10 text-foreground/70">This request doesn&apos;t exist.</p>;

  const isAuthor = profile?.uid === post.authorId;
  const isProvider = profile?.role === "provider";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {post.type === "service" && <Badge tone="orange">Service · {skillLabel(post.skill)}</Badge>}
          {post.type === "part" && <Badge tone="orange">Part · {partTypeLabel(post.partType)}</Badge>}
          {post.type === "question" && <Badge tone="orange">Question</Badge>}
          {post.status === "assigned" ? <Badge tone="green">Assigned</Badge> : post.status === "closed" ? <Badge>Closed</Badge> : <Badge>Open</Badge>}
        </div>
        <h1 className="mt-3 text-xl font-semibold">{post.bikeLabel}</h1>
        <p className="mt-1 text-sm text-foreground/60">
          {post.authorName} · {post.city} · {timeAgo(post.createdAt?.toDate())}
        </p>
        <p className="mt-4 whitespace-pre-wrap">{post.text}</p>
        {post.photos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-28 w-28 rounded-md object-cover" />
            ))}
          </div>
        )}
      </Card>

      {post.type === "service" && isAuthor && <RiderOffers post={post} />}
      {post.type === "service" && !isAuthor && isProvider && profile && <ProviderOffer post={post} profile={profile} />}

      {post.type === "part" && (
        <>
          <MatchingProducts bikeKey={post.bikeKey} partType={post.partType ?? ""} />
          <Replies postId={post.id} allowProductSuggest />
        </>
      )}
      {post.type === "question" && <Replies postId={post.id} allowProductSuggest={false} />}
    </div>
  );
}
