// Part B owns this file (Shared Contract). Part A created it first, in the
// contract's shape, so onboarding could be built. Part B: keep or replace.

export const SKILLS: { key: string; label: string }[] = [
  { key: "general", label: "General" },
  { key: "engine", label: "Engine" },
  { key: "electrical", label: "Electrical" },
  { key: "tuning", label: "Tuning" },
  { key: "detailing", label: "Detailing" },
  { key: "tyres", label: "Tyres" },
  { key: "modification", label: "Modification" },
  { key: "bodywork_paint", label: "Bodywork & Paint" },
];

export function skillLabel(key: string | null | undefined): string {
  return SKILLS.find((s) => s.key === key)?.label ?? key ?? "";
}
