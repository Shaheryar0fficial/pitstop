import type { Metadata } from "next";
import { Suspense } from "react";
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
        {/* NavBar and AuthGate read the URL (usePathname). Under Cache Components
            that has to sit inside <Suspense>, or dynamic routes like /stores/[id]
            and /posts/[id] fail `next build`. (Added by Part B.) */}
        <Suspense fallback={<div className="h-[57px] border-b border-black/10 dark:border-white/10" />}>
          <NavBar />
        </Suspense>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          <Suspense fallback={null}>
            <AuthGate>{children}</AuthGate>
          </Suspense>
        </main>
      </body>
    </html>
  );
}
