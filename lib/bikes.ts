// Part B owns this file (Shared Contract). Part A created it first, in the
// contract's shape, so posting could be built. Part B: keep or replace.

export const BIKES: { key: string; label: string; brand: string }[] = [
  { key: "honda-cbr150r", label: "Honda CBR150R", brand: "Honda" },
  { key: "honda-cbr250rr", label: "Honda CBR250RR", brand: "Honda" },
  { key: "honda-cbr500r", label: "Honda CBR500R", brand: "Honda" },
  { key: "honda-cb500x", label: "Honda CB500X", brand: "Honda" },
  { key: "yamaha-r15", label: "Yamaha YZF-R15", brand: "Yamaha" },
  { key: "yamaha-r3", label: "Yamaha YZF-R3", brand: "Yamaha" },
  { key: "yamaha-mt15", label: "Yamaha MT-15", brand: "Yamaha" },
  { key: "suzuki-gsxr150", label: "Suzuki GSX-R150", brand: "Suzuki" },
  { key: "suzuki-gsxr600", label: "Suzuki GSX-R600", brand: "Suzuki" },
  { key: "suzuki-hayabusa", label: "Suzuki Hayabusa", brand: "Suzuki" },
  { key: "kawasaki-ninja250", label: "Kawasaki Ninja 250", brand: "Kawasaki" },
  { key: "kawasaki-ninja400", label: "Kawasaki Ninja 400", brand: "Kawasaki" },
  { key: "kawasaki-ninja650", label: "Kawasaki Ninja 650", brand: "Kawasaki" },
  { key: "kawasaki-z650", label: "Kawasaki Z650", brand: "Kawasaki" },
  { key: "ktm-duke200", label: "KTM Duke 200", brand: "KTM" },
  { key: "ktm-duke390", label: "KTM Duke 390", brand: "KTM" },
  { key: "ktm-rc390", label: "KTM RC 390", brand: "KTM" },
  { key: "benelli-tnt150", label: "Benelli TNT 150", brand: "Benelli" },
  { key: "benelli-trk251", label: "Benelli TRK 251", brand: "Benelli" },
  { key: "benelli-302s", label: "Benelli 302S", brand: "Benelli" },
  { key: "other", label: "Other", brand: "Other" },
];

export function bikeLabel(key: string | null | undefined): string {
  return BIKES.find((b) => b.key === key)?.label ?? key ?? "";
}
