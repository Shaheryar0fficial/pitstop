"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/firebase";
import { getProviderBill, type ProviderBill } from "@/lib/billing-provider";
import { StoreBill } from "@/components/shell/placeholders";
import { Card } from "@/components/shell/ui";

export default function BillingPage() {
  const { loading, profile } = useUser();
  if (loading) return null;
  if (!profile) return <p className="py-10 text-foreground/70">Sign in to see your bill.</p>;
  if (profile.role === "store_owner") return <StoreBill uid={profile.uid} />;
  if (profile.role !== "provider") return <p className="py-10 text-foreground/70">Riders use PitStop free. There&apos;s nothing to pay.</p>;
  return <ProviderBillView uid={profile.uid} />;
}

function ProviderBillView({ uid }: { uid: string }) {
  const [bill, setBill] = useState<ProviderBill | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProviderBill(uid)
      .then(setBill)
      .catch((e) => setError(e.message));
  }, [uid]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Billing</h1>
      {error && <p className="break-all text-sm text-red-600">{error}</p>}
      {!bill && !error && <p className="text-foreground/60">Loading…</p>}
      {bill && (
        <Card>
          <div className="text-sm text-foreground/60">{bill.monthLabel}</div>
          <div className="mt-2 text-lg">
            {bill.approvedCount} approved {bill.approvedCount === 1 ? "request" : "requests"} × Rs. {bill.fee.toLocaleString()}
          </div>
          <div className="mt-1 text-3xl font-semibold">Rs. {bill.total.toLocaleString()} due</div>
          <p className="mt-4 text-sm text-foreground/60">
            Sending offers is free. You pay only for requests a rider approves. Pay by JazzCash, Easypaisa, or bank transfer.
          </p>
        </Card>
      )}
    </div>
  );
}
