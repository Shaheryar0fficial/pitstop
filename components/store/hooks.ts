"use client";

import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getPricing } from "@/lib/billing-store";
import { DEFAULT_PRICING, type Pricing } from "@/lib/store-types";

/** config/pricing, falling back to the example prices until it loads. */
export function usePricing(): Pricing {
  const [pricing, setPricing] = useState<Pricing>(DEFAULT_PRICING);
  useEffect(() => {
    let alive = true;
    getPricing().then((p) => alive && setPricing(p));
    return () => {
      alive = false;
    };
  }, []);
  return pricing;
}

/** Uploads images to Firebase Storage under `folder/` and returns their download URLs. */
export async function uploadImages(files: File[], folder: string): Promise<string[]> {
  return Promise.all(
    files.map(async (file) => {
      const r = ref(storage, `${folder}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`);
      await uploadBytes(r, file);
      return getDownloadURL(r);
    }),
  );
}
