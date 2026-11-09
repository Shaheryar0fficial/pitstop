/* eslint-disable @next/next/no-img-element -- product photos come from Firebase Storage URLs */
"use client";

import Link from "next/link";
import { bikeLabel } from "@/lib/bikes";
import { partTypeLabel } from "@/lib/partTypes";
import { conditionLabel, type Product } from "@/lib/store-types";
import { formatRs, whatsappLink } from "./format";
import { ConditionBadge, btnSecondary, btnWhatsapp } from "./ui";

/**
 * One product. `bikeKey` (optional) is the bike the rider is shopping for;
 * it goes into the pre-filled WhatsApp message.
 */
export default function ProductCard({
  product,
  bikeKey,
  onMarkSold,
}: {
  product: Product;
  bikeKey?: string;
  onMarkSold?: () => void;
}) {
  const part = partTypeLabel(product.partType);
  const bike = bikeLabel(bikeKey ?? product.bikeKeys[0]);
  const message = `Hi, I saw your ${part} for ${bike} on PitStop (${product.name}). Is it available?`;
  const photo = product.photos?.[0];
  const sold = product.status === "sold";

  return (
    <div className={`flex flex-col overflow-hidden rounded-lg border border-black/10 dark:border-white/10 ${sold ? "opacity-60" : ""}`}>
      {photo ? (
        <img src={photo} alt={product.name} className="aspect-video w-full object-cover sm:aspect-[4/3]" />
      ) : (
        <div className="flex aspect-video w-full items-center sm:aspect-[4/3] justify-center bg-gradient-to-br from-orange-600/15 to-black/5 text-sm font-medium text-foreground/60 dark:to-white/5">
          {part}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <ConditionBadge condition={product.condition} label={conditionLabel(product.condition)} />
          {sold ? <span className="rounded bg-black/10 px-1.5 py-0.5 text-xs font-medium dark:bg-white/10">Sold</span> : null}
        </div>
        <h3 className="text-sm font-semibold leading-snug">{product.name}</h3>
        <p className="text-lg font-bold">{formatRs(product.price)}</p>
        <p className="text-xs text-foreground/60">
          Fits: {product.bikeKeys.map((k) => bikeLabel(k)).join(", ")}
        </p>
        <Link href={`/stores/${product.storeId}`} className="text-xs text-foreground/70 hover:underline">
          {product.storeName} · {product.city}
        </Link>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {!sold && product.whatsapp ? (
            <a href={whatsappLink(product.whatsapp, message)} target="_blank" rel="noreferrer" className={btnWhatsapp}>
              WhatsApp seller
            </a>
          ) : null}
          {onMarkSold && !sold ? (
            <button onClick={onMarkSold} className={btnSecondary}>
              Mark as sold
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
