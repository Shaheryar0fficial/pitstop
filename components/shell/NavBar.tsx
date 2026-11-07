"use client";

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

export default function NavBar() {
  const { loading, authUser, profile } = useUser();
  const pathname = usePathname();

  const visible = LINKS.filter((l) => !l.roles || (profile && l.roles.includes(profile.role)));

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-background/90 backdrop-blur dark:border-white/10">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Pit<span className="text-orange-600">Stop</span>
        </Link>

        <div className="flex flex-1 gap-1 overflow-x-auto text-sm">
          {visible.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 ${
                  active
                    ? "bg-orange-600/10 font-medium text-orange-700 dark:text-orange-400"
                    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {loading ? null : authUser ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-foreground/70 sm:inline">
              {profile?.name ?? authUser.displayName}
            </span>
            <button
              onClick={() => signOutUser()}
              className="rounded-md border border-black/15 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signInWithGoogle().catch((e) => alert(e.message))}
            className="rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            Sign in with Google
          </button>
        )}
      </nav>
    </header>
  );
}
