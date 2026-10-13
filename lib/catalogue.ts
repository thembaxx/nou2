import rows from "@/data/toyota-2026-10-13.json";
import type { Vehicle } from "./types";
export const CATALOGUE_CHECKED_AT = "2026-10-13";
// A reviewed snapshot of manufacturer pages, never dealership stock or an offer.
export const catalogue: Vehicle[] = rows
  .map((row): Vehicle => {
    const range = row.rangeName.replace(/^Toyota\s+/i, "");
    const model =
      row.name.toLowerCase().includes(range.toLowerCase()) ||
      (range === "Land Cruiser Prado" && /prado/i.test(row.name))
        ? row.name
        : `${range} ${row.name}`;
    const fuelType = /plug-in/i.test(row.fuelType)
      ? "Plug-in Hybrid"
      : /hybrid/i.test(row.fuelType)
        ? "Hybrid"
        : /diesel/i.test(row.fuelType)
          ? "Diesel"
          : "Petrol";
    const consumptionAvailable = Number.isFinite(Number(row.fuelcon));
    return {
      id: `catalogue-toyota-${row.id}`,
      condition: "NEW",
      name: `Toyota ${model}`,
      make: "Toyota",
      year: 0,
      price: Number(row.price),
      km: 0,
      fuel: consumptionAvailable ? Number(row.fuelcon) : 7,
      fuelType,
      transmission: /manual/i.test(row.transmission) ? "Manual" : "Automatic",
      bodyType:
        (
          {
            hatch: "Hatchback",
            suv: "SUV",
            sedan: "Sedan",
            coupe: "Coupe",
            "mini-van-taxi": "MPV",
          } as Record<string, string>
        )[row.bodyType] || "Other",
      images: [row.image.mobile || row.image.thumbnail || "/images/toyota.webp"],
      location: "South Africa",
      sellerType: "DEALER",
      sellerName: "Toyota South Africa · manufacturer reference",
      status: "REFERENCE",
      example: false,
      description: `Manufacturer-published model and reference price, observed on ${CATALOGUE_CHECKED_AT}. This is a catalogue model, not a specific car in stock. Confirm the current price, VAT, on-road charges, model year, options, warranty, service plan and delivery date with an authorised dealer. Published consumption is a laboratory figure; real driving can use more fuel.`,
      reference: {
        url: row.sourceUrl,
        checkedAt: CATALOGUE_CHECKED_AT,
        range,
        seats: Number(row.seats),
        consumptionAvailable,
      },
    };
  })
  .sort((a, b) => a.price - b.price);
export const featuredNewCars = [
  ...new Map(
    catalogue.map((v) => [
      v.reference!.range,
      catalogue.find((c) => c.reference!.range === v.reference!.range)!,
    ]),
  ).values(),
].slice(0, 4);
