import "server-only";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma/client";
import ws from "ws";

const globalDb = globalThis as unknown as { carpurDb?: PrismaClient };

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Database is not configured");
  if (!globalDb.carpurDb) {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString });
    globalDb.carpurDb = new PrismaClient({ adapter });
  }
  return globalDb.carpurDb;
}
