"use client";

// Integration component (Shared Contract). Part A places it on post/new when
// type == "question". Waits until the rider stops typing (~800 ms) and the
// text is 20+ characters, then asks /api/similar for matching past threads.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getIdToken } from "@/lib/firebase";

type Match = { id: string; text: string; replyCount: number };

export function SimilarThreads({ text, bikeKey }: { text: string; bikeKey: string }) {
  const trimmed = text.trim();
  const key = trimmed.length >= 20 && bikeKey ? `${bikeKey}|${trimmed}` : null;
  const [result, setResult] = useState<{ key: string; matches: Match[] } | null>(null);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const token = await getIdToken();
        if (!token) return setResult({ key, matches: [] });
        const res = await fetch("/api/similar", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text: trimmed, bikeKey }),
          signal: controller.signal,
        });
        const data = res.ok ? await res.json() : { matches: [] };
        setResult({ key, matches: Array.isArray(data.matches) ? data.matches : [] });
      } catch (e) {
        // Aborted because the rider kept typing: a newer request is coming.
        if ((e as Error).name !== "AbortError") setResult({ key, matches: [] });
      }
    }, 800);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, trimmed, bikeKey]);

  const done = result !== null && result.key === key;
  const matches = done ? result.matches : [];

  if (!key) return null;
  if (!done) return <p className="text-xs text-foreground/50">Checking for similar questions…</p>;
  if (matches.length === 0) return null;

  return (
    <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/[0.07] p-4">
      <p className="text-sm font-semibold">Someone already asked this — here&apos;s what riders said</p>
      <ul className="space-y-1.5">
        {matches.map((m) => (
          <li key={m.id}>
            <Link
              href={`/posts/${m.id}`}
              target="_blank"
              className="block rounded-md px-2 py-1.5 text-sm hover:bg-amber-500/10"
            >
              <span className="font-medium">{m.text}</span>{" "}
              <span className="text-xs text-foreground/60">
                · {m.replyCount} {m.replyCount === 1 ? "reply" : "replies"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-foreground/60">Still different? Go ahead and post your question.</p>
    </div>
  );
}

export default SimilarThreads;
