"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import { skillLabel } from "@/lib/skills";
import type { Post, UserProfile } from "@/lib/types";
import { StoreInbox } from "@/components/store/StoreInbox";
import { Badge, Card, timeAgo } from "@/components/shell/ui";

export default function InboxPage() {
  const { loading, profile } = useUser();
  if (loading) return null;
  if (!profile) return <p className="py-10 text-foreground/70">Sign in to see your inbox.</p>;
  if (profile.role === "store_owner") return <StoreInbox uid={profile.uid} />;
  if (profile.role !== "provider") {
    return <p className="py-10 text-foreground/70">The inbox is for service providers and store owners.</p>;
  }
  return <ProviderInbox profile={profile} />;
}

function ProviderInbox({ profile }: { profile: UserProfile }) {
  const skills = profile.skills ?? [];
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");

  // Key the subscription on the values the query uses, not the object.
  const skillsKey = skills.join(",");

  useEffect(() => {
    const mySkills = skillsKey ? skillsKey.split(",") : [];
    if (mySkills.length === 0) return;
    // Live: open service requests that match my skills in my city.
    const q = query(
      collection(db, "posts"),
      where("type", "==", "service"),
      where("skill", "in", mySkills.slice(0, 30)),
      where("city", "==", profile.city),
      where("status", "==", "open"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        setError("");
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post));
      },
      // A missing index shows up here with a link to create it.
      (e) => setError(e.message),
    );
  }, [skillsKey, profile.city]);

  if (skills.length === 0) {
    return (
      <p className="py-10 text-foreground/70">
        Add your skills in <Link href="/onboarding" className="text-orange-600 underline">your profile</Link> to receive requests.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="mt-1 text-foreground/70">
          Live requests for {skills.map(skillLabel).join(", ")} in {profile.city}. New ones appear here instantly.
        </p>
      </div>

      {error && <p className="break-all text-sm text-red-600">{error}</p>}
      {posts === null && !error && <p className="text-foreground/60">Loading…</p>}
      {posts?.length === 0 && <Card className="text-foreground/60">No open requests right now.</Card>}

      <div className="space-y-3">
        {posts?.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`} className="block">
            <Card className="transition hover:border-orange-600/50">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="orange">{skillLabel(p.skill)}</Badge>
                <span className="font-medium">{p.bikeLabel}</span>
                <span className="text-sm text-foreground/50">· {p.authorName} · {timeAgo(p.createdAt?.toDate())}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-foreground/80">{p.text}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
