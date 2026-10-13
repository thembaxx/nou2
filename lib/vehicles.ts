import "server-only";
import { databaseConfigured, getDb } from "./db";
import type { Vehicle } from "./types";
import { examples } from "./examples";
import { catalogue } from "./catalogue";
import type { Listing } from "@prisma/client";
export function publicVehicle(row: Listing): Vehicle {
  return {
    id: row.id,
    condition: row.condition === "NEW" ? "NEW" : "USED",
    name: row.name,
    make: row.make,
    year: row.year,
    price: row.price,
    km: row.km,
    fuel: row.fuel,
    fuelType: row.fuelType,
    transmission: row.transmission,
    bodyType: row.bodyType,
    images: row.images,
    location: row.location,
    sellerType: row.sellerType === "DEALER" ? "DEALER" : "PRIVATE",
    sellerName: row.sellerName,
    description: row.description,
    status: row.status,
    example: false,
  };
}
export async function inventory() {
  if (!databaseConfigured()) return { vehicles: [] as Vehicle[], available: false };
  try {
    const rows = await getDb().listing.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ condition: "asc" }, { createdAt: "desc" }],
      take: 200,
    });
    return { vehicles: rows.map(publicVehicle), available: true };
  } catch {
    return { vehicles: [] as Vehicle[], available: false };
  }
}
export async function vehicleById(id: string) {
  const example = [...catalogue, ...examples].find((v) => v.id === id);
  if (example) return example;
  if (!databaseConfigured()) return null;
  try {
    const row = await getDb().listing.findFirst({ where: { id, status: "PUBLISHED" } });
    return row ? publicVehicle(row) : null;
  } catch {
    return null;
  }
}
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
