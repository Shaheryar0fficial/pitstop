"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import { uploadImage } from "@/lib/upload";
import { BIKES } from "@/lib/bikes";
import { SKILLS } from "@/lib/skills";
import { PART_TYPES } from "@/lib/partTypes";
import { CITIES, type PostType, type UserProfile } from "@/lib/types";
import { SimilarThreads } from "@/components/community/SimilarThreads";
import { Field, inputCls, primaryBtn } from "@/components/shell/ui";

const TYPES: { key: PostType; label: string; blurb: string }[] = [
  { key: "service", label: "Service", blurb: "A mechanic, detailer, or tuner" },
  { key: "part", label: "Part", blurb: "A part for your bike" },
  { key: "question", label: "Question", blurb: "Advice from the community" },
];

const MAX_PHOTOS = 3;

export default function PostNeedPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense>
      <PostNeed />
    </Suspense>
  );
}

function PostNeed() {
  const { loading, authUser, profile } = useUser();
  if (loading) return null;
  if (!authUser || !profile) return <p className="py-10 text-foreground/70">Sign in to post a need.</p>;
  if (profile.role !== "rider") {
    return <p className="py-10 text-foreground/70">Only riders post needs. Providers and store owners see them in their inbox.</p>;
  }
  return <PostForm profile={profile} />;
}

function PostForm({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const params = useSearchParams();

  // The AI Assistant links here with ?type=service&skill=general&text=...
  const [type, setType] = useState<PostType | null>((params.get("type") as PostType) || null);
  const [skill, setSkill] = useState(params.get("skill") ?? "");
  const [partType, setPartType] = useState("");
  const [bikeKey, setBikeKey] = useState("");
  const [year, setYear] = useState("");
  const [city, setCity] = useState(profile.city);
  const [text, setText] = useState(params.get("text") ?? "");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const problems = [
    !type && "what you need",
    type === "service" && !skill && "a skill",
    type === "part" && !partType && "a part type",
    !bikeKey && "your bike",
    !city && "a city",
    text.trim().length < 10 && "a description (at least 10 characters)",
  ].filter(Boolean) as string[];

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    setError("");
    try {
      const picked = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
      const urls = await Promise.all(picked.map((f) => uploadImage(f, "posts", profile.uid)));
      setPhotos((p) => [...p, ...urls]);
    } catch (e) {
      setError(`Photo upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!type || problems.length) return;
    setSaving(true);
    setError("");
    const bike = BIKES.find((b) => b.key === bikeKey)!;
    try {
      const ref = await addDoc(collection(db, "posts"), {
        authorId: profile.uid,
        authorName: profile.name,
        city,
        bikeKey,
        bikeLabel: year ? `${bike.label} ${year}` : bike.label,
        type,
        skill: type === "service" ? skill : null,
        partType: type === "part" ? partType : null,
        text: text.trim(),
        photos,
        status: "open",
        approvedOfferId: null,
        upvotes: 0,
        replyCount: 0,
        createdAt: serverTimestamp(),
      });
      router.push(`/posts/${ref.id}`);
    } catch (e) {
      setError(`Couldn't post: ${(e as Error).message}`);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Post a need</h1>
        <p className="mt-1 text-foreground/70">
          Not sure what you need?{" "}
          <Link href="/assistant" className="text-orange-600 underline">
            Ask the AI Assistant
          </Link>
          .
        </p>
      </div>

      <Field label="What do you need?">
        <div className="grid gap-2 sm:grid-cols-3">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={`rounded-lg border p-3 text-left ${
                type === t.key
                  ? "border-orange-600 bg-orange-600/10"
                  : "border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="mt-1 text-xs text-foreground/60">{t.blurb}</div>
            </button>
          ))}
        </div>
      </Field>

      {type === "service" && (
        <Field label="Which kind of mechanic?">
          <select value={skill} onChange={(e) => setSkill(e.target.value)} className={inputCls}>
            <option value="">Pick a skill</option>
            {SKILLS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      {type === "part" && (
        <Field label="Which part?">
          <select value={partType} onChange={(e) => setPartType(e.target.value)} className={inputCls}>
            <option value="">Pick a part type</option>
            {PART_TYPES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
        <Field label="Bike">
          <select value={bikeKey} onChange={(e) => setBikeKey(e.target.value)} className={inputCls}>
            <option value="">Pick your bike</option>
            {BIKES.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Year (optional)">
          <input value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={inputCls} />
        </Field>
      </div>

      <Field label="City">
        <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Describe it">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={
            type === "part"
              ? "e.g. Need a genuine headlight assembly, mine cracked"
              : type === "question"
                ? "e.g. Engine makes a ticking noise at idle, is this normal?"
                : "e.g. Full detailing before a weekend ride"
          }
          className={inputCls}
        />
      </Field>

      {type === "question" && bikeKey && text.trim().length >= 20 && (
        <SimilarThreads text={text} bikeKey={bikeKey} />
      )}

      <Field label={`Photos (optional, up to ${MAX_PHOTOS})`}>
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="h-20 w-20 rounded-md object-cover" />
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-black/25 text-xs text-foreground/60 dark:border-white/25">
              {uploading ? "Uploading…" : "+ Add"}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
            </label>
          )}
        </div>
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {problems.length > 0 && <p className="text-sm text-foreground/60">Still needed: {problems.join(", ")}.</p>}

      <button onClick={submit} disabled={saving || uploading || problems.length > 0} className={`w-full ${primaryBtn}`}>
        {saving ? "Posting…" : "Post"}
      </button>
    </div>
  );
}
