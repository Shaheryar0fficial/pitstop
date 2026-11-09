"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signInWithGoogle, signOutUser, useUser } from "@/lib/firebase";

const LINKS: { href: string; label: string; roles?: string[] }[] = [
  { href: "/", label: "Community" },
  { href: "/post/new", label: "Post a need", roles: ["rider"] },
  { href: "/inbox", label: "Inbox", roles: ["provider", "store_owner"] },
  { href: "/parts", label: "Parts" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/billing", label: "Billing", roles: ["provider", "store_owner"] },
];

const linkStyle = (active: boolean) =>
  active
    ? "bg-orange-600/10 font-medium text-orange-700 dark:text-orange-400"
    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10";

// Below the `lg` breakpoint (1024px) the links move into a menu opened by the
// ☰ button, so every link stays reachable on phones and tablets.
export default function NavBar() {
  const { loading, authUser, profile } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visible = LINKS.filter((l) => !l.roles || (profile && l.roles.includes(profile.role)));
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const close = () => setOpen(false);
  const signIn = () => signInWithGoogle().catch((e) => alert(e.message));
  const name = profile?.name ?? authUser?.displayName ?? "";

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-background/90 backdrop-blur dark:border-white/10">
      <nav className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" onClick={close} className="shrink-0 text-lg font-bold tracking-tight">
          Pit<span className="text-orange-600">Stop</span>
        </Link>

        {/* Desktop: links inline */}
        <div className="hidden flex-1 gap-1 text-sm lg:flex">
          {visible.map((l) => (
            <Link key={l.href} href={l.href} className={`whitespace-nowrap rounded-md px-3 py-1.5 ${linkStyle(isActive(l.href))}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex-1 lg:hidden" />

        {loading ? null : authUser ? (
          <div className="hidden items-center gap-3 text-sm lg:flex">
            <span className="max-w-40 truncate text-foreground/70">{name}</span>
            <button
              onClick={() => signOutUser()}
              className="rounded-md border border-black/15 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="shrink-0 rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            <span className="sm:hidden">Sign in</span>
            <span className="hidden sm:inline">Sign in with Google</span>
          </button>
        )}

        {/* Phones and tablets: menu button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-black/15 hover:bg-black/5 lg:hidden dark:border-white/20 dark:hover:bg-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-black/10 lg:hidden dark:border-white/10">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 text-sm">
            {visible.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className={`rounded-md px-3 py-2.5 ${linkStyle(isActive(l.href))}`}
              >
                {l.label}
              </Link>
            ))}
            {authUser ? (
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-black/10 pt-3 dark:border-white/10">
                <span className="min-w-0 truncate text-foreground/70">{name}</span>
                <button
                  onClick={() => {
                    close();
                    signOutUser();
                  }}
                  className="shrink-0 rounded-md border border-black/15 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
