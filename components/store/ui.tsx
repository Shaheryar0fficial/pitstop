// Shared UI bits for Part B, styled to match Part A's shell.

import Link from "next/link";

export const inputCls =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-600 dark:border-white/20";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10";
export const btnWhatsapp =
  "inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700";
export const cardCls = "rounded-lg border border-black/10 p-4 dark:border-white/10";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-foreground/60">{hint}</span> : null}
    </label>
  );
}

/** Shows a Firestore error. "Index required" errors carry a console link; make it clickable. */
export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  const url = message.match(/https:\/\/\S+/)?.[0];
  return (
    <div className="rounded-md border border-red-600/30 bg-red-600/5 p-3 text-sm text-red-700 dark:text-red-400">
      {url ? (
        <>
          This screen needs a Firestore index.{" "}
          <a href={url} target="_blank" rel="noreferrer" className="font-medium underline">
            Create it in the Firebase console
          </a>
          , wait about a minute, then reload.
        </>
      ) : (
        message
      )}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-black/15 p-6 text-center text-sm text-foreground/60 dark:border-white/15">
      {children}
    </div>
  );
}

export function Gate({ title, children, href, cta }: { title: string; children?: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <h1 className="text-xl font-semibold">{title}</h1>
      {children ? <div className="mt-2 text-foreground/70">{children}</div> : null}
      {href && cta ? (
        <Link href={href} className={`${btnPrimary} mt-4`}>
          {cta}
        </Link>
      ) : null}
    </div>
  );
}

const CONDITION_STYLES: Record<string, string> = {
  new_genuine: "bg-green-600/10 text-green-700 dark:text-green-400",
  new_copy: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  used_genuine: "bg-sky-600/10 text-sky-700 dark:text-sky-400",
};

export function ConditionBadge({ condition, label }: { condition: string; label: string }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${CONDITION_STYLES[condition] ?? "bg-black/5"}`}>
      {label}
    </span>
  );
}
