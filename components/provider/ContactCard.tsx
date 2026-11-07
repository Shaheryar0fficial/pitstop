"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import { Card, whatsappLink } from "@/components/shell/ui";

/**
 * Shown on the request page only after the rider approves an offer.
 * This is the only place a WhatsApp button appears for services.
 */
export default function ContactCard({ otherUid, heading, message }: { otherUid: string; heading: string; message: string }) {
  const [other, setOther] = useState<UserProfile | null>(null);

  useEffect(() => {
    getDoc(doc(db, "users", otherUid)).then((snap) => {
      if (snap.exists()) setOther({ uid: snap.id, ...snap.data() } as UserProfile);
    });
  }, [otherUid]);

  return (
    <Card className="border-green-600/40 bg-green-600/5">
      <div className="font-medium">{heading}</div>
      {other ? (
        <a
          href={whatsappLink(other.whatsapp, message)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
        >
          WhatsApp {other.name}
        </a>
      ) : (
        <p className="mt-2 text-sm text-foreground/60">Loading contact…</p>
      )}
    </Card>
  );
}
