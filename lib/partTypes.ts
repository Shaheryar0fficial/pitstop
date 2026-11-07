// Part B owns this file (Shared Contract). Part A created it first, in the
// contract's shape, so posting could be built. Part B: keep or replace.

export const PART_TYPES: { key: string; label: string }[] = [
  { key: "headlight", label: "Headlight" },
  { key: "tail_light", label: "Tail light" },
  { key: "indicators", label: "Indicators" },
  { key: "brake_pads", label: "Brake pads" },
  { key: "chain_sprocket", label: "Chain & sprocket kit" },
  { key: "tyre", label: "Tyre" },
  { key: "battery", label: "Battery" },
  { key: "air_filter", label: "Air filter" },
  { key: "oil_filter", label: "Oil filter" },
  { key: "mirrors", label: "Mirrors" },
  { key: "body_panels", label: "Body panels" },
  { key: "exhaust", label: "Exhaust" },
  { key: "other", label: "Other" },
];

export function partTypeLabel(key: string | null | undefined): string {
  return PART_TYPES.find((p) => p.key === key)?.label ?? key ?? "";
}
