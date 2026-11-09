/* eslint-disable @next/next/no-img-element -- logo preview from a Firebase Storage URL */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import { CITIES, normalizeWhatsapp, type UserProfile } from "@/lib/types";
import type { Store } from "@/lib/store-types";
import { formatRs } from "@/components/store/format";
import { uploadImages, usePricing } from "@/components/store/hooks";
import { useLiveDoc } from "@/components/store/live";
import { Field, Gate, btnPrimary, btnSecondary, inputCls } from "@/components/store/ui";

export default function NewStorePage() {
  const { loading, authUser, profile } = useUser();
  const uid = authUser?.uid ?? null;
  const existing = useLiveDoc<Store>(uid ? `store:${uid}` : null, () => doc(db, "stores", uid!));

  if (loading || existing.loading) return null;
  if (!authUser) return <Gate title="Sign in to open your store">Use the Sign in with Google button at the top.</Gate>;
  if (!profile) return null; // AuthGate sends them to onboarding
  if (profile.role !== "store_owner") {
    return (
      <Gate title="Only store owners can open a store" href="/onboarding" cta="Change my role">
        Your account is set up as a {profile.role === "provider" ? "service provider" : "rider"}.
      </Gate>
    );
  }

  return <StoreForm key={existing.data ? "edit" : "new"} uid={authUser.uid} profile={profile} store={existing.data} />;
}

function StoreForm({ uid, profile, store }: { uid: string; profile: UserProfile; store: Store | null }) {
  const router = useRouter();
  const pricing = usePricing();
  const [name, setName] = useState(store?.name ?? "");
  const [city, setCity] = useState(store?.city ?? profile.city ?? "");
  const [area, setArea] = useState(store?.area ?? "");
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp ?? profile.whatsapp ?? "");
  const [logoURL, setLogoURL] = useState(store?.logoURL ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const phone = normalizeWhatsapp(whatsapp);
  const problems = [
    !name.trim() && "a store name",
    !city && "a city",
    !area.trim() && "an area",
    !/^92\d{10}$/.test(phone) && "a valid WhatsApp number (e.g. 0300 1234567)",
  ].filter(Boolean) as string[];

  async function uploadLogo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const [url] = await uploadImages([file], `stores/${uid}`);
      setLogoURL(url);
    } catch (e) {
      setError(`Logo upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (problems.length) return;
    setSaving(true);
    setError("");
    try {
      await setDoc(doc(db, "stores", uid), {
        ownerId: uid,
        name: name.trim(),
        city,
        area: area.trim(),
        logoURL,
        whatsapp: phone,
        verified: store?.verified ?? false,
        createdAt: store?.createdAt ?? serverTimestamp(),
      });
      router.push(`/stores/${uid}`);
    } catch (e) {
      setError(`Couldn't save your store: ${(e as Error).message}`);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{store ? "Edit your store" : "Open your store on PitStop"}</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Riders browse your parts and contact you on WhatsApp. Store placement is{" "}
          <span className="font-medium">{formatRs(pricing.storeMonthlyFee)} / month</span>, plus{" "}
          {formatRs(pricing.productFee)} for each product you list.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Store name">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hamza Superbike Parts" />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="City">
            <select className={inputCls} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Pick a city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Area">
            <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. McLeod Road" />
          </Field>
        </div>
        <Field label="WhatsApp number" hint="Riders tap a button to message you here.">
          <input className={inputCls} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0300 1234567" />
        </Field>
        <Field label="Logo (optional)">
          <div className="flex items-center gap-3">
            {logoURL ? <img src={logoURL} alt="Store logo" className="h-14 w-14 rounded-md object-cover" /> : null}
            <input type="file" accept="image/*" disabled={uploading} onChange={(e) => uploadLogo(e.target.files)} className="text-sm" />
            {uploading ? <span className="text-sm text-foreground/60">Uploading…</span> : null}
          </div>
        </Field>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {problems.length ? <p className="text-sm text-foreground/60">Still needed: {problems.join(", ")}.</p> : null}

      <div className="flex gap-3">
        <button className={btnPrimary} disabled={saving || uploading || problems.length > 0} onClick={save}>
          {saving ? "Saving…" : store ? "Save changes" : "Open my store"}
        </button>
        {store ? (
          <button className={btnSecondary} onClick={() => router.push(`/stores/${uid}`)}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
