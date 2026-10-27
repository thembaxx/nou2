import "server-only";
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { getDb } from "./db";

/** Use the stable inbox columns during the additive notification migration rollout. */
export async function saveEnquiry(
  input: { listingId: string; buyerId: string; message: string },
  db: PrismaClient = getDb(),
) {
  const id = randomUUID();
  const rows = await db.$queryRaw<
    { id: string }[]
  >`INSERT INTO "Enquiry" ("id", "listingId", "buyerId", "message") VALUES (${id}, ${input.listingId}, ${input.buyerId}, ${input.message}) RETURNING "id"`;
  if (rows.length !== 1 || rows[0].id !== id)
    throw new Error("Enquiry persistence could not be confirmed");
  return rows[0];
}

export async function notificationStatuses(ids: string[], db: PrismaClient = getDb()) {
  if (!ids.length) return new Map<string, string>();
  try {
    const rows = await db.enquiry.findMany({
      where: { id: { in: ids } },
      select: { id: true, notificationStatus: true },
    });
    return new Map(rows.map((row) => [row.id, row.notificationStatus]));
  } catch (error) {
    // Existing inbox reads remain useful when the optional notification schema is absent.
    console.error(
      "Carpur notification status unavailable",
      error instanceof Error ? error.name : "UnknownError",
    );
    return new Map<string, string>();
  }
}
