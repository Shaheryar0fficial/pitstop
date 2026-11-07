"use client";

import { useState } from "react";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage, useUser } from "@/lib/firebase";
import { SKILLS } from "@/lib/skills";
import { BRANDS, CITIES, ROLES, normalizeWhatsapp, type Role, type UserProfile } from "@/lib/types";

const MAX_PORTFOLIO = 4;

export default function OnboardingPage() {
  const { loading, authUser, profile } = useUser();

  if (loading) return null;
  if (!authUser) {
    return <p className="py-10 text-foreground/70">Sign in with Google to set up your profile.</p>;
  }
  // Keyed so the form starts fresh from whatever profile exists when it mounts.
  return <OnboardingForm key={authUser.uid} authUser={authUser} profile={profile} />;
}

function OnboardingForm({ authUser, profile }: { authUser: User; profile: UserProfile | null }) {
  const router = useRouter();

  // Prefill from an existing profile when editing, otherwise from Google.
  const [name, setName] = useState(profile?.name ?? authUser.displayName ?? "");
  const [role, setRole] = useState<Role | null>(profile?.role ?? null);
  const [city, setCity] = useState(profile?.city ?? "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? "");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [brands, setBrands] = useState<string[]>(profile?.brands ?? []);
  const [portfolio, setPortfolio] = useState<string[]>(profile?.portfolio ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_PORTFOLIO - portfolio.length;
    const picked = Array.from(files).slice(0, room);
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(
        picked.map(async (file) => {
          const r = ref(storage, `portfolio/${authUser.uid}/${Date.now()}-${file.name}`);
          await uploadBytes(r, file);
          return getDownloadURL(r);
        }),
      );
      setPortfolio((p) => [...p, ...urls]);
    } catch (e) {
      setError(`Photo upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  const phone = normalizeWhatsapp(whatsapp);
  const isProvider = role === "provider";
  const problems = [
    !name.trim() && "your name",
    !role && "a role",
    !city && "a city",
    !/^92\d{10}$/.test(phone) && "a valid WhatsApp number (e.g. 0300 1234567)",
    isProvider && skills.length === 0 && "at least one skill",
  ].filter(Boolean) as string[];

  async function save() {
    if (!role || problems.length) return;
    setSaving(true);
    setError("");
    const data: Omit<UserProfile, "uid"> = {
      name: name.trim(),
      photoURL: authUser.photoURL ?? "",
      city,
      whatsapp: phone,
      role,
      ...(isProvider && {
        skills,
        brands,
        portfolio,
        // Keep seeded ratings if they exist; new providers start at 0.
        rating: profile?.rating ?? 0,
        ratingCount: profile?.ratingCount ?? 0,
      }),
    };
    try {
      await setDoc(doc(db, "users", authUser.uid), data);
      router.replace(role === "store_owner" ? "/stores/new" : role === "provider" ? "/inbox" : "/post/new");
    } catch (e) {
      setError(`Couldn't save: ${(e as Error).message}`);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{profile ? "Edit your profile" : "Welcome to PitStop"}</h1>
        <p className="mt-1 text-foreground/70">Tell us who you are so we can show you the right requests.</p>
      </div>

      <Field label="Your name">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>

      <Field label="I am a…">
        <div className="grid gap-2 sm:grid-cols-3">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={`rounded-lg border p-3 text-left ${
                role === r.key
                  ? "border-orange-600 bg-orange-600/10"
                  : "border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              }`}
            >
              <div className="font-medium">{r.label}</div>
              <div className="mt-1 text-xs text-foreground/60">{r.blurb}</div>
            </button>
          ))}
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City">
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
            <option value="">Pick a city</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="WhatsApp number">
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="0300 1234567"
            inputMode="tel"
            className={inputCls}
          />
        </Field>
      </div>

      {isProvider && (
        <>
          <Field label="Skills (riders who need these will find you)">
            <Chips options={SKILLS.map((s) => [s.key, s.label])} selected={skills} onToggle={(v) => toggle(skills, setSkills, v)} />
          </Field>
          <Field label="Bike brands you work on">
            <Chips options={BRANDS.map((b) => [b, b])} selected={brands} onToggle={(v) => toggle(brands, setBrands, v)} />
          </Field>
          <Field label={`Portfolio photos (up to ${MAX_PORTFOLIO})`}>
            <div className="flex flex-wrap gap-2">
              {portfolio.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-20 w-20 rounded-md object-cover" />
                  <button
                    type="button"
                    onClick={() => setPortfolio((p) => p.filter((u) => u !== url))}
                    className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1.5 text-xs text-white"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {portfolio.length < MAX_PORTFOLIO && (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-black/25 text-xs text-foreground/60 dark:border-white/25">
                  {uploading ? "Uploading…" : "+ Add"}
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
                </label>
              )}
            </div>
          </Field>
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {problems.length > 0 && <p className="text-sm text-foreground/60">Still needed: {problems.join(", ")}.</p>}

      <button
        onClick={save}
        disabled={saving || uploading || problems.length > 0}
        className="w-full rounded-md bg-orange-600 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : role === "store_owner" ? "Continue to create your store" : "Save and continue"}
      </button>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-600/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: [string, string][];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onToggle(value)}
          className={`rounded-full border px-3 py-1 text-sm ${
            selected.includes(value)
              ? "border-orange-600 bg-orange-600 text-white"
              : "border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
