"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { skillLabel } from "@/lib/skills";
import type { Offer, Post } from "@/lib/types";
import { Badge, Card, primaryBtn } from "@/components/shell/ui";
import ContactCard from "./ContactCard";

/** The rider's view of offers on their own service request. */
export default function RiderOffers({ post }: { post: Post }) {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "offers"), where("postId", "==", post.id), orderBy("providerRating", "desc"));
    return onSnapshot(
      q,
      (snap) => setOffers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Offer)),
      (e) => setError(e.message),
    );
  }, [post.id]);

  async function approve(offer: Offer) {
    if (post.status !== "open") return;
    setApproving(offer.id);
    setError("");
    try {
      // One batch: the offer and the post always change together.
      // approvedAt must be serverTimestamp() — the security rules check it against request.time.
      const batch = writeBatch(db);
      batch.update(doc(db, "offers", offer.id), { status: "approved", approvedAt: serverTimestamp() });
      batch.update(doc(db, "posts", post.id), { status: "assigned", approvedOfferId: offer.id });
      await batch.commit();
    } catch (e) {
      setError(`Couldn't approve: ${(e as Error).message}`);
    } finally {
      setApproving(null);
    }
  }

  const approved = offers?.find((o) => o.id === post.approvedOfferId);

  return (
    <div className="space-y-3">
      {approved && (
        <ContactCard
          otherUid={approved.providerId}
          heading={`You approved ${approved.providerName}. Contact them on WhatsApp to arrange the job.`}
          message={`Hi ${approved.providerName}, I approved your offer on PitStop for my ${post.bikeLabel} (${skillLabel(post.skill)}).`}
        />
      )}

      <h2 className="text-lg font-semibold">Offers {offers ? `(${offers.length})` : ""}</h2>
      {error && <p className="break-all text-sm text-red-600">{error}</p>}
      {offers?.length === 0 && (
        <Card className="text-foreground/60">
          No offers yet. Matching {skillLabel(post.skill).toLowerCase()} providers in {post.city} can see your request now.
        </Card>
      )}

      {offers?.map((o) => {
        const isApproved = o.id === post.approvedOfferId;
        return (
          <Card key={o.id} className={isApproved ? "border-green-600/50" : ""}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link href={`/providers/${o.providerId}`} className="font-medium hover:underline">
                  {o.providerName}
                </Link>
                <span className="text-sm text-foreground/60">
                  <span className="text-orange-600">★</span> {o.providerRating.toFixed(1)}
                </span>
                {isApproved && <Badge tone="green">Approved</Badge>}
              </div>
              <div className="text-right">
                <div className="font-semibold">Rs. {o.priceEstimate.toLocaleString()}</div>
                <div className="text-xs text-foreground/60">{o.when}</div>
              </div>
            </div>
            <p className="mt-2 text-foreground/80">{o.message}</p>
            {!isApproved && (
              <button
                onClick={() => approve(o)}
                // Disabled on every other offer once the request is assigned.
                disabled={post.status !== "open" || approving !== null}
                className={`mt-3 ${primaryBtn}`}
              >
                {approving === o.id ? "Approving…" : post.status === "open" ? "Approve" : "Request assigned"}
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
