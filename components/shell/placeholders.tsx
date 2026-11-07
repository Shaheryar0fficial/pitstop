// Stand-ins for Part B's integration components (Shared Contract).
// Same props as the real ones. At a checkpoint, swap the import in the page
// that uses it — one line each — and leave this file alone.

function Slot({ name, props }: { name: string; props: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border border-dashed border-black/20 p-4 text-sm text-foreground/60 dark:border-white/20">
      <span className="font-medium">{name}</span> (Part B) · {JSON.stringify(props)}
    </div>
  );
}

export function MatchingProducts(props: { bikeKey: string; partType: string }) {
  return <Slot name="MatchingProducts" props={props} />;
}

export function Replies(props: { postId: string; allowProductSuggest: boolean }) {
  return <Slot name="Replies" props={props} />;
}

export function SimilarThreads(props: { text: string; bikeKey: string }) {
  return <Slot name="SimilarThreads" props={props} />;
}

export function StoreInbox(props: { uid: string }) {
  return <Slot name="StoreInbox" props={props} />;
}

export function StoreBill(props: { uid: string }) {
  return <Slot name="StoreBill" props={props} />;
}
