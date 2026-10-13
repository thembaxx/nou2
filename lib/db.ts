import "server-only";
import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { carpurDb?: PrismaClient };
export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
export function getDb() {
  if (!databaseConfigured()) throw new Error("Database is not configured");
  if (!globalDb.carpurDb) globalDb.carpurDb = new PrismaClient();
  return globalDb.carpurDb;
}
