// Part B owns this file (Shared Contract).
// Bike dropdown used everywhere: posts, products, the feed filter.
// The key is what we store (`bikeKey`); the label is what people see.
// Merged from Part A's first version and Part B's, so every key either side
// (or the seed) uses stays valid. `brand` is kept from Part A's version.

export const BIKES: { key: string; label: string; brand: string }[] = [
  { key: "honda-cbr150r", label: "Honda CBR150R", brand: "Honda" },
  { key: "honda-cbr250rr", label: "Honda CBR250RR", brand: "Honda" },
  { key: "honda-cbr500r", label: "Honda CBR500R", brand: "Honda" },
  { key: "honda-cb500x", label: "Honda CB500X", brand: "Honda" },
  { key: "yamaha-r15", label: "Yamaha YZF-R15", brand: "Yamaha" },
  { key: "yamaha-r3", label: "Yamaha YZF-R3", brand: "Yamaha" },
  { key: "yamaha-mt15", label: "Yamaha MT-15", brand: "Yamaha" },
  { key: "suzuki-gsxr150", label: "Suzuki GSX-R150", brand: "Suzuki" },
  { key: "suzuki-gixxer250", label: "Suzuki Gixxer SF 250", brand: "Suzuki" },
  { key: "suzuki-gsxr600", label: "Suzuki GSX-R600", brand: "Suzuki" },
  { key: "suzuki-hayabusa", label: "Suzuki Hayabusa", brand: "Suzuki" },
  { key: "kawasaki-ninja250", label: "Kawasaki Ninja 250", brand: "Kawasaki" },
  { key: "kawasaki-ninja400", label: "Kawasaki Ninja 400", brand: "Kawasaki" },
  { key: "kawasaki-ninja650", label: "Kawasaki Ninja 650", brand: "Kawasaki" },
  { key: "kawasaki-z650", label: "Kawasaki Z650", brand: "Kawasaki" },
  { key: "kawasaki-z900", label: "Kawasaki Z900", brand: "Kawasaki" },
  { key: "ktm-duke200", label: "KTM Duke 200", brand: "KTM" },
  { key: "ktm-duke390", label: "KTM Duke 390", brand: "KTM" },
  { key: "ktm-rc390", label: "KTM RC 390", brand: "KTM" },
  { key: "benelli-tnt150", label: "Benelli TNT 150", brand: "Benelli" },
  { key: "benelli-trk251", label: "Benelli TRK 251", brand: "Benelli" },
  { key: "benelli-trk502", label: "Benelli TRK 502", brand: "Benelli" },
  { key: "benelli-302s", label: "Benelli 302S", brand: "Benelli" },
  { key: "benelli-leoncino500", label: "Benelli Leoncino 500", brand: "Benelli" },
  { key: "bmw-g310r", label: "BMW G 310 R", brand: "BMW" },
  { key: "other", label: "Other", brand: "Other" },
];

export function bikeLabel(key: string | null | undefined): string {
  return BIKES.find((b) => b.key === key)?.label ?? key ?? "";
}
