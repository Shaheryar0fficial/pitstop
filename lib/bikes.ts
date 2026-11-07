// Part B owns this file (Shared Contract).
// Bike dropdown used everywhere: posts, products, the feed filter.
// The key is what we store (`bikeKey`); the label is what people see.

export const BIKES: { key: string; label: string }[] = [
  { key: "honda-cbr150r", label: "Honda CBR150R" },
  { key: "honda-cbr250rr", label: "Honda CBR250RR" },
  { key: "honda-cbr500r", label: "Honda CBR500R" },
  { key: "honda-cb500x", label: "Honda CB500X" },
  { key: "yamaha-r15", label: "Yamaha YZF-R15" },
  { key: "yamaha-r3", label: "Yamaha YZF-R3" },
  { key: "yamaha-mt15", label: "Yamaha MT-15" },
  { key: "suzuki-gsxr150", label: "Suzuki GSX-R150" },
  { key: "suzuki-gixxer250", label: "Suzuki Gixxer SF 250" },
  { key: "suzuki-hayabusa", label: "Suzuki Hayabusa" },
  { key: "kawasaki-ninja250", label: "Kawasaki Ninja 250" },
  { key: "kawasaki-ninja400", label: "Kawasaki Ninja 400" },
  { key: "kawasaki-ninja650", label: "Kawasaki Ninja 650" },
  { key: "kawasaki-z900", label: "Kawasaki Z900" },
  { key: "ktm-duke390", label: "KTM 390 Duke" },
  { key: "ktm-rc390", label: "KTM RC 390" },
  { key: "benelli-tnt150", label: "Benelli TNT 150i" },
  { key: "benelli-trk502", label: "Benelli TRK 502" },
  { key: "benelli-leoncino500", label: "Benelli Leoncino 500" },
  { key: "bmw-g310r", label: "BMW G 310 R" },
  { key: "other", label: "Other" },
];

export function bikeLabel(key: string | null | undefined): string {
  return BIKES.find((b) => b.key === key)?.label ?? key ?? "";
}
