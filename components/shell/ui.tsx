// Small shared UI bits for Part A pages.

export const inputCls =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-600/40";

export const primaryBtn =
  "rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryBtn =
  "rounded-md border border-black/15 px-4 py-2 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-black/10 p-4 dark:border-white/15 ${className}`}>{children}</div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "orange" | "green" }) {
  const tones = {
    neutral: "bg-black/5 text-foreground/70 dark:bg-white/10",
    orange: "bg-orange-600/10 text-orange-700 dark:text-orange-400",
    green: "bg-green-600/10 text-green-700 dark:text-green-400",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Stars({ rating, count }: { rating?: number; count?: number }) {
  if (!count) return <span className="text-sm text-foreground/50">No ratings yet</span>;
  return (
    <span className="text-sm">
      <span className="text-orange-600">★</span> {(rating ?? 0).toFixed(1)}{" "}
      <span className="text-foreground/50">({count})</span>
    </span>
  );
}

/** wa.me link with a pre-filled message. `number` is digits only, e.g. 923001234567. */
export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function timeAgo(date: Date | null | undefined): string {
  if (!date) return "just now";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
