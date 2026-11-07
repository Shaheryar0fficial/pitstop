"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { skillLabel } from "@/lib/skills";
import type { Offer, Post, UserProfile } from "@/lib/types";
import { Badge, Card, Field, inputCls, primaryBtn } from "@/components/shell/ui";
import ContactCard from "./ContactCard";

/** A provider's view of a service request: send an offer, then see whether it was approved. */
export default function ProviderOffer({ post, profile }: { post: Post; profile: UserProfile }) {
  const [mine, setMine] = useState<Offer | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [when, setWhen] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "offers"), where("postId", "==", post.id), where("providerId", "==", profile.uid));
    return onSnapshot(
      q,
      (snap) => setMine(snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Offer)),
      (e) => setError(e.message),
    );
  }, [post.id, profile.uid]);

  const canOffer = (profile.skills ?? []).includes(post.skill ?? "");
  const priceNum = Number(price);
  const valid = message.trim().length >= 5 && priceNum > 0 && when.trim().length > 0;

  async function send() {
    if (!valid) return;
    setSending(true);
    setError("");
    try {
      await addDoc(collection(db, "offers"), {
        postId: post.id,
        postAuthorId: post.authorId,
        providerId: profile.uid,
        providerName: profile.name,
        providerRating: profile.rating ?? 0,
        message: message.trim(),
        priceEstimate: priceNum,
        when: when.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
        approvedAt: null,
      });
    } catch (e) {
      setError(`Couldn't send offer: ${(e as Error).message}`);
    } finally {
      setSending(false);
    }
  }

  if (mine === undefined) return <p className="text-foreground/60">Loading…</p>;

  // Approved: contact unlocks now, and this job counts on the provider's bill.
  if (mine?.status === "approved") {
    return (
      <div className="space-y-3">
        <ContactCard
          otherUid={post.authorId}
          heading={`${post.authorName} approved your offer. This job is now on your bill.`}
          message={`Hi ${post.authorName}, this is ${profile.name} from PitStop about your ${post.bikeLabel} (${skillLabel(post.skill)}) request.`}
        />
      </div>
    );
  }

  if (mine) {
    return (
      <Card>
        <div className="flex items-center gap-2">
          <span className="font-medium">Your offer</span>
          {post.status === "open" ? <Badge>Waiting for the rider</Badge> : <Badge>Assigned to another provider</Badge>}
        </div>
        <p className="mt-2 text-foreground/80">{mine.message}</p>
        <p className="mt-1 text-sm text-foreground/60">
          Rs. {mine.priceEstimate.toLocaleString()} · {mine.when}
        </p>
      </Card>
    );
  }

  if (post.status !== "open") return <Card className="text-foreground/60">This request has been assigned.</Card>;
  if (!canOffer) return <Card className="text-foreground/60">This request needs a skill that isn&apos;t on your profile.</Card>;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Send an offer</h2>
        <p className="text-sm text-foreground/60">Sending an offer is free. You&apos;re charged only if the rider approves it.</p>
      </div>
      <Field label="Message">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} placeholder="What you'll do and what's included" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price estimate (Rs.)">
          <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={inputCls} />
        </Field>
        <Field label="When">
          <input value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} placeholder="e.g. Tomorrow, 11am" />
        </Field>
      </div>
      {error && <p className="break-all text-sm text-red-600">{error}</p>}
      <button onClick={send} disabled={!valid || sending} className={primaryBtn}>
        {sending ? "Sending…" : "Send offer"}
      </button>
    </Card>
  );
}
