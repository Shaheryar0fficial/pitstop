// Part B owns this file (Shared Contract).
// Part types for part requests and products. The key is stored as `partType`.
// (Part A created an identical first version so posting could be built.)

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

/** Stock photo for a part type (public/parts/, see CREDITS.md there). */
export function partTypeImage(key: string | null | undefined): string {
  const known = PART_TYPES.some((p) => p.key === key);
  return `/parts/${known ? key : "other"}.jpg`;
}
