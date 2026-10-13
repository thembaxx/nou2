export const realModels = [
  {
    id: "ferrari-458",
    name: "Ferrari 458 · Open Roof",
    make: "Ferrari",
    year: 0,
    body: "Convertible",
    fuel: "Petrol",
    provider: "local",
    asset: "/models/ferrari-458-italia.glb",
    paint: "Body_Color",
    author: "vicent091036",
    source: "https://github.com/mrdoob/three.js/blob/dev/examples/webgl_materials_car.html",
    license: "Three.js repository MIT licence",
    licenseUrl: "/models/THREE-LICENSE.txt",
    official: "https://www.ferrari.com/en-EN/auto/458-italia",
    note: "Open-roof artist model of the Ferrari 458 family. The geometry does not match the hard-top Italia coupe. This is an exploration model, not a specific factory trim or a Carpur offer.",
  },
  {
    id: "toyota-corolla-cross",
    name: "Toyota Corolla Cross",
    make: "Toyota",
    year: 2021,
    body: "SUV",
    fuel: "Petrol",
    provider: "sketchfab",
    uid: "cfcaebfa5e5a4170b6f2db8db7ca3436",
    author: "007 / tangwang920",
    source:
      "https://sketchfab.com/3d-models/2021-toyota-corolla-cross-cfcaebfa5e5a4170b6f2db8db7ca3436",
    license: "CC Attribution",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    official: "https://www.toyota.co.za/ranges/corolla-cross",
    note: "Artist model of the 2021 Corolla Cross. Current South African trims and facelift details can differ. Confirm specifications with the dealer.",
  },
  {
    id: "bmw-m3-e30",
    name: "BMW M3 E30",
    make: "BMW",
    year: 0,
    body: "Coupe",
    fuel: "Petrol",
    provider: "local",
    asset: "/models/bmw-m3-e30.glb",
    paint: "BMW_E30_M3_PAINT",
    uid: "ac3c7013434e403e8faff87948caf422",
    author: "Martin Trafas / TinoD2",
    source: "https://sketchfab.com/3d-models/free-bmw-m3-e30-ac3c7013434e403e8faff87948caf422",
    license: "CC Attribution",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    official: "https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m3-e30-portraet.html",
    note: "Artist model of the classic BMW M3 E30, not a BMW 320i or a current-generation M3. No Carpur stock is implied.",
  },
] as const;
export type RealModel = (typeof realModels)[number];

export function matchingRealModel(vehicle: {
  make: string;
  name: string;
  year: number;
  bodyType: string;
}) {
  if (
    vehicle.make === "Toyota" &&
    /Corolla\s+Cross/i.test(vehicle.name) &&
    vehicle.year === 2021 &&
    vehicle.bodyType === "SUV"
  )
    return "toyota-corolla-cross";
  if (
    vehicle.make === "BMW" &&
    /M3.*E30|E30.*M3/i.test(vehicle.name) &&
    vehicle.year >= 1986 &&
    vehicle.year <= 1991 &&
    vehicle.bodyType === "Coupe"
  )
    return "bmw-m3-e30";
  return null;
}
