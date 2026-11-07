import Link from "next/link";

// Placeholder until Part A ships the AI Bike Assistant (Feature 6).
export default function AssistantComingSoon() {
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-600/10 text-2xl">🔧</div>
      <h1 className="mt-4 text-2xl font-semibold">AI Bike Assistant is coming soon</h1>
      <p className="mt-3 text-foreground/70">
        Describe a problem with your bike and the assistant will suggest likely causes, whether it&apos;s a DIY fix or a
        job for a pro, which mechanic to book, and a rough cost in Rs. This feature will be added in the next update.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/post/new"
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Post a need instead
        </Link>
        <Link
          href="/"
          className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Ask the community
        </Link>
      </div>
    </div>
  );
}
