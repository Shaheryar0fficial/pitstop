"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, doc, getCountFromServer, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { skillLabel } from "@/lib/skills";
import type { UserProfile } from "@/lib/types";
import { Badge, Card, Stars } from "@/components/shell/ui";

interface Review {
  id: string;
  riderName: string;
  rating: number;
  text: string;
}

/**
 * Public provider profile. No WhatsApp button here on purpose:
 * contact opens only after a rider approves an offer.
 * Reviews are read-only and come from the seed data.
 */
export default function ProviderPage() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<UserProfile | null | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [approvedJobs, setApprovedJobs] = useState<number | null>(null);

  useEffect(() => {
    getDoc(doc(db, "users", id)).then((snap) =>
      setProvider(snap.exists() && snap.data().role === "provider" ? ({ uid: snap.id, ...snap.data() } as UserProfile) : null),
    );
    getDocs(query(collection(db, "users", id, "reviews"), orderBy("createdAt", "desc")))
      .then((snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review)))
      .catch(() => setReviews([]));
    getCountFromServer(query(collection(db, "offers"), where("providerId", "==", id), where("status", "==", "approved")))
      .then((c) => setApprovedJobs(c.data().count))
      .catch(() => setApprovedJobs(null));
  }, [id]);

  if (provider === undefined) return <p className="text-foreground/60">Loading…</p>;
  if (provider === null) return <p className="py-10 text-foreground/70">This provider doesn&apos;t exist.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <div className="flex items-center gap-4">
          {provider.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={provider.photoURL} alt="" className="h-16 w-16 rounded-full object-cover" />
          )}
          <div>
            <h1 className="text-xl font-semibold">{provider.name}</h1>
            <p className="text-sm text-foreground/60">{provider.city}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Stars rating={provider.rating} count={provider.ratingCount} />
              {approvedJobs !== null && <span className="text-sm text-foreground/60">{approvedJobs} approved jobs</span>}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(provider.skills ?? []).map((s) => (
            <Badge key={s} tone="orange">{skillLabel(s)}</Badge>
          ))}
        </div>
        {(provider.brands ?? []).length > 0 && (
          <p className="mt-3 text-sm text-foreground/70">Works on: {(provider.brands ?? []).join(", ")}</p>
        )}
        <p className="mt-4 text-sm text-foreground/60">
          To contact {provider.name.split(" ")[0]}, post a request. Contact opens once you approve their offer.
        </p>
      </Card>

      {(provider.portfolio ?? []).length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Portfolio</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(provider.portfolio ?? []).map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="aspect-square w-full rounded-md object-cover" />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Reviews</h2>
        {reviews.length === 0 ? (
          <Card className="text-foreground/60">No reviews yet.</Card>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <Card key={r.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.riderName}</span>
                  <span className="text-orange-600">{"★".repeat(Math.round(r.rating))}</span>
                </div>
                <p className="mt-1 text-foreground/80">{r.text}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
