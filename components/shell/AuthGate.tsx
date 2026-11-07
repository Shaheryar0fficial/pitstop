"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { firebaseConfigured, useUser } from "@/lib/firebase";

/** Sends signed-in users without a profile to /onboarding. Shows a setup notice if Firebase isn't configured. */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, authUser, profile } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const needsOnboarding = !loading && authUser && !profile && pathname !== "/onboarding";

  useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding");
  }, [needsOnboarding, router]);

  if (!firebaseConfigured) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-xl font-semibold">Firebase isn&apos;t configured yet</h1>
        <p className="mt-2 text-foreground/70">
          Copy <code>.env.local.example</code> to <code>.env.local</code>, fill in your Firebase web app config, then
          restart <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
