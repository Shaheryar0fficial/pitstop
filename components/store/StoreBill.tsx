"use client";

// Integration component (Shared Contract). Part A places it on /billing when
// role == "store_owner".

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoreBill, type StoreBillData } from "@/lib/billing-store";
import { formatRs } from "./format";
import { btnPrimary, btnSecondary } from "./ui";

type State = { uid: string; bill: StoreBillData | null; error: string; version: number };

export function StoreBill({ uid }: { uid: string }) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    let alive = true;
    getStoreBill(uid)
      .then((bill) => alive && setState({ uid, bill, error: "", version }))
      .catch((e: Error) => alive && setState({ uid, bill: null, error: e.message, version }));
    return () => {
      alive = false;
    };
  }, [uid, version]);

  const current = state && state.uid === uid && state.version === version ? state : null;
  const bill = current?.bill ?? null;

  return (
    <section className="max-w-xl space-y-4 rounded-lg border border-black/10 p-5 dark:border-white/10">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Store bill{bill ? ` · ${bill.monthLabel}` : ""}</h2>
        <button className={btnSecondary} onClick={() => setVersion((v) => v + 1)} disabled={!current}>
          Refresh
        </button>
      </div>

      {current?.error ? <p className="text-sm text-red-600">Couldn&apos;t load your bill: {current.error}</p> : null}

      {!current ? (
        <p className="text-sm text-foreground/60">Working out what you owe…</p>
      ) : bill && !bill.hasStore ? (
        <div className="space-y-3 text-sm text-foreground/70">
          <p>You haven&apos;t opened a store yet, so nothing is due.</p>
          <Link href="/stores/new" className={btnPrimary}>
            Open my store
          </Link>
        </div>
      ) : bill ? (
        <>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/70">Store placement</dt>
              <dd className="font-medium">{formatRs(bill.storeMonthlyFee)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/70">
                {bill.productsThisMonth} {bill.productsThisMonth === 1 ? "product" : "products"} listed × {formatRs(bill.productFee)}
              </dt>
              <dd className="font-medium">{formatRs(bill.productsThisMonth * bill.productFee)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-black/10 pt-2 text-base dark:border-white/10">
              <dt className="font-semibold">Due this month</dt>
              <dd className="font-bold text-orange-700 dark:text-orange-400">{formatRs(bill.total)}</dd>
            </div>
          </dl>
          <p className="text-sm text-foreground/70">
            Store placement {formatRs(bill.storeMonthlyFee)} + {bill.productsThisMonth} products × {formatRs(bill.productFee)} ={" "}
            <span className="font-medium">{formatRs(bill.total)}</span> due this month.
          </p>
          <p className="text-xs text-foreground/60">
            Pay by JazzCash, Easypaisa or bank transfer. Products marked as sold still count for the month they were listed.
          </p>
        </>
      ) : null}
    </section>
  );
}

export default StoreBill;
