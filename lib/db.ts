import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

// Preserve the existing singleton so hot reloads do not open extra DB pools.
const globalDb = globalThis as unknown as { carpurDb?: PrismaClient };

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Database is not configured");
  if (url.startsWith("prisma://") || url.startsWith("prisma+postgres://")) {
    throw new Error("This database URL uses Prisma Accelerate; use a direct Neon PostgreSQL URL for the Neon adapter.");
  }
  if (!globalDb.carpurDb) {
    const adapter = new PrismaNeon({ connectionString: url });
    globalDb.carpurDb = new PrismaClient({ adapter });
  }
  return globalDb.carpurDb;
}
