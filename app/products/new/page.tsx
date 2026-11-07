/* eslint-disable @next/next/no-img-element -- photo previews from Firebase Storage URLs */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { db, useUser } from "@/lib/firebase";
import { BIKES } from "@/lib/bikes";
import { PART_TYPES } from "@/lib/partTypes";
import { CONDITIONS, type ProductCondition, type Store } from "@/lib/store-types";
import { formatRs } from "@/components/store/format";
import { uploadImages, usePricing } from "@/components/store/hooks";
import { useLiveDoc } from "@/components/store/live";
import { Field, Gate, btnPrimary, inputCls } from "@/components/store/ui";

const MAX_PHOTOS = 4;

export default function NewProductPage() {
  const { loading, authUser, profile } = useUser();
  const uid = authUser?.uid ?? null;
  const store = useLiveDoc<Store>(uid ? `store:${uid}` : null, () => doc(db, "stores", uid!));

  if (loading || store.loading) return null;
  if (!authUser) return <Gate title="Sign in to add products">Use the Sign in with Google button at the top.</Gate>;
  if (!profile) return null;
  if (profile.role !== "store_owner") {
    return <Gate title="Only store owners can list products" href="/onboarding" cta="Change my role" />;
  }
  if (!store.data) {
    return (
      <Gate title="Open your store first" href="/stores/new" cta="Open my store">
        Products are listed under your store, so set that up first.
      </Gate>
    );
  }

  return <ProductForm uid={authUser.uid} store={store.data} />;
}

function ProductForm({ uid, store }: { uid: string; store: Store }) {
  const router = useRouter();
  const pricing = usePricing();
  const [name, setName] = useState("");
  const [partType, setPartType] = useState("");
  const [bikeKeys, setBikeKeys] = useState<string[]>([]);
  const [condition, setCondition] = useState<ProductCondition>("new_genuine");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const priceNumber = Number(price);
  const problems = [
    !name.trim() && "a product name",
    !partType && "a part type",
    bikeKeys.length === 0 && "at least one compatible bike",
    !(priceNumber > 0) && "a price",
    photos.length === 0 && "at least one photo",
  ].filter(Boolean) as string[];

  const toggleBike = (key: string) =>
    setBikeKeys((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const picked = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
    if (!picked.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = await uploadImages(picked, `products/${uid}`);
      setPhotos((p) => [...p, ...urls]);
    } catch (e) {
      setError(`Photo upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (problems.length) return;
    setSaving(true);
    setError("");
    try {
      await addDoc(collection(db, "products"), {
        storeId: uid,
        storeName: store.name,
        city: store.city,
        whatsapp: store.whatsapp,
        name: name.trim(),
        partType,
        bikeKeys,
        condition,
        price: Math.round(priceNumber),
        photos,
        status: "active",
        createdAt: serverTimestamp(),
      });
      router.push(`/stores/${uid}`);
    } catch (e) {
      setError(`Couldn't list the product: ${(e as Error).message}`);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add a product</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Listed under <span className="font-medium">{store.name}</span>. Each product listed costs{" "}
          <span className="font-medium">{formatRs(pricing.productFee)}</span>. To take it down later, mark it as sold.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Product name">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ninja 400 LED Headlight Assembly" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Part type">
            <select className={inputCls} value={partType} onChange={(e) => setPartType(e.target.value)}>
              <option value="">Pick a part type</option>
              {PART_TYPES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price (Rs.)">
            <input className={inputCls} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 14500" />
          </Field>
        </div>

        <Field label="Condition">
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCondition(c.key)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  condition === c.key
                    ? "border-orange-600 bg-orange-600/10 font-medium text-orange-700 dark:text-orange-400"
                    : "border-black/15 dark:border-white/20"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Compatible bikes" hint="Pick every bike this part fits. Riders searching for these bikes will see it.">
          <div className="flex flex-wrap gap-1.5">
            {BIKES.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => toggleBike(b.key)}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  bikeKeys.includes(b.key)
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-black/15 dark:border-white/20"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Photos (at least 1, up to ${MAX_PHOTOS})`}>
          <div className="flex flex-wrap items-center gap-3">
            {photos.map((url) => (
              <img key={url} src={url} alt="Product" className="h-20 w-20 rounded-md object-cover" />
            ))}
            {photos.length < MAX_PHOTOS ? (
              <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => addPhotos(e.target.files)} className="text-sm" />
            ) : null}
            {uploading ? <span className="text-sm text-foreground/60">Uploading…</span> : null}
          </div>
        </Field>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {problems.length ? <p className="text-sm text-foreground/60">Still needed: {problems.join(", ")}.</p> : null}

      <button className={btnPrimary} disabled={saving || uploading || problems.length > 0} onClick={save}>
        {saving ? "Listing…" : `List product (${formatRs(pricing.productFee)})`}
      </button>
    </div>
  );
}
