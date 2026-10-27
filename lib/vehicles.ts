import "server-only";
import { databaseConfigured, getDb } from "./db";
import type { Vehicle } from "./types";
import { examples } from "./examples";
import { catalogue } from "./catalogue";
import type { Listing, Prisma } from "@prisma/client";
import { BODY_TYPES, FUEL_TYPES } from "./vehicle-options";

export const INVENTORY_PAGE_SIZE = 24;
export const INVENTORY_MAX_PAGE = 10_000;
export type InventoryFilters = {
  query: string;
  make: string;
  condition: "" | "NEW" | "USED";
  body: string;
  fuel: string;
  sellerType: "" | "PRIVATE" | "DEALER";
  maxPrice: number | null;
  sort: "new-first" | "newest" | "price-low" | "price-high" | "mileage";
  page: number;
};
export type InventoryPage = {
  vehicles: Vehicle[];
  available: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  makes: string[];
};

/** Reject malformed filters instead of letting them alter the database query. */
export function parseInventoryQuery(params: URLSearchParams): InventoryFilters {
  const text = (name: string, maxLength: number, fallback = "") => {
    const value = (params.get(name) ?? fallback).trim();
    if (
      value.length > maxLength ||
      Array.from(value).some((character) => character.charCodeAt(0) < 32)
    ) {
      throw new RangeError(`The ${name} filter is invalid.`);
    }
    return value;
  };
  const choice = <T extends string>(name: string, choices: readonly T[], fallback: T): T => {
    const value = text(name, 40, fallback);
    if (!choices.includes(value as T)) throw new RangeError(`Choose a supported ${name} filter.`);
    return value as T;
  };
  const page = text("page", 8, "1");
  if (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > INVENTORY_MAX_PAGE) {
    throw new RangeError(`Choose a page between 1 and ${INVENTORY_MAX_PAGE}.`);
  }
  const maximum = text("maxPrice", 10);
  if (
    maximum &&
    (!/^\d+$/.test(maximum) || Number(maximum) < 1 || Number(maximum) > 1_000_000_000)
  ) {
    throw new RangeError("Choose a maximum price between R1 and R1,000,000,000.");
  }
  return {
    query: text("query", 120, params.get("q") ?? ""),
    make: text("make", 60),
    condition: choice("condition", ["", "NEW", "USED"] as const, ""),
    body: choice("body", ["", ...BODY_TYPES], ""),
    fuel: choice("fuel", ["", ...FUEL_TYPES], ""),
    sellerType: choice("sellerType", ["", "PRIVATE", "DEALER"] as const, ""),
    maxPrice: maximum ? Number(maximum) : null,
    sort: choice(
      "sort",
      ["new-first", "newest", "price-low", "price-high", "mileage"] as const,
      "new-first",
    ),
    page: Number(page),
  };
}

export async function paginatedInventory(input: InventoryFilters): Promise<InventoryPage> {
  // Validate even internal callers; pagination and query values must remain bounded.
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value !== null) params.set(key, String(value));
  }
  const filters = parseInventoryQuery(params);
  const empty: InventoryPage = {
    vehicles: [],
    available: false,
    total: 0,
    page: filters.page,
    pageSize: INVENTORY_PAGE_SIZE,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
    makes: [],
  };
  if (!databaseConfigured()) return empty;
  const where: Prisma.ListingWhereInput = {
    status: "PUBLISHED",
    ...(filters.make ? { make: { equals: filters.make, mode: "insensitive" } } : {}),
    ...(filters.condition ? { condition: filters.condition } : {}),
    ...(filters.body ? { bodyType: filters.body } : {}),
    ...(filters.fuel ? { fuelType: filters.fuel } : {}),
    ...(filters.sellerType ? { sellerType: filters.sellerType } : {}),
    ...(filters.maxPrice !== null ? { price: { lte: filters.maxPrice } } : {}),
    ...(filters.query
      ? {
          OR: ["name", "make", "location"].map((field) => ({
            [field]: { contains: filters.query.replace(/[\\%_]/g, "\\$&"), mode: "insensitive" },
          })),
        }
      : {}),
  };
  const tieBreak: Prisma.ListingOrderByWithRelationInput[] = [
    { createdAt: "desc" },
    { id: "desc" },
  ];
  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    filters.sort === "new-first"
      ? [{ condition: "asc" }, ...tieBreak]
      : filters.sort === "price-low"
        ? [{ price: "asc" }, ...tieBreak]
        : filters.sort === "price-high"
          ? [{ price: "desc" }, ...tieBreak]
          : filters.sort === "mileage"
            ? [{ km: "asc" }, ...tieBreak]
            : tieBreak;
  try {
    return await getDb().$transaction(
      async (tx) => {
        const total = await tx.listing.count({ where });
        const totalPages = Math.min(
          INVENTORY_MAX_PAGE,
          Math.max(1, Math.ceil(total / INVENTORY_PAGE_SIZE)),
        );
        const page = Math.min(filters.page, totalPages);
        const rows = await tx.listing.findMany({
          where,
          orderBy,
          skip: (page - 1) * INVENTORY_PAGE_SIZE,
          take: INVENTORY_PAGE_SIZE,
        });
        const makeRows = await tx.listing.groupBy({
          by: ["make"],
          where: { status: "PUBLISHED" },
          orderBy: { make: "asc" },
        });
        return {
          vehicles: rows.map(publicVehicle),
          available: true,
          total,
          page,
          pageSize: INVENTORY_PAGE_SIZE,
          totalPages,
          hasPrevious: page > 1,
          hasNext: page < totalPages,
          makes: makeRows.map((row) => row.make),
        };
      },
      { isolationLevel: "RepeatableRead" },
    );
  } catch {
    return empty;
  }
}
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
