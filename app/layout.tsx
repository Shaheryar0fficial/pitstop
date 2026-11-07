import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/shell/NavBar";
import AuthGate from "@/components/shell/AuthGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PitStop",
  description: "Mechanics, parts, and advice for Pakistani heavy bike owners",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Both read the URL, which isn't known while prerendering dynamic
            routes like /posts/[id], so they need Suspense boundaries. */}
        <Suspense fallback={<div className="h-[57px] border-b border-black/10 dark:border-white/10" />}>
          <NavBar />
        </Suspense>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          <Suspense fallback={<p className="text-foreground/60">Loading…</p>}>
            <AuthGate>{children}</AuthGate>
          </Suspense>
        </main>
      </body>
    </html>
  );
}
