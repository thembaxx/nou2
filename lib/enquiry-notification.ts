import "server-only";
import { createHash } from "node:crypto";
import type { PrismaClient } from "./generated/prisma/client";
import { getDb } from "./db";
import {
  sendTransactionalEmail,
  transactionalEmailConfigured,
  type EmailEnvironment,
} from "./transactional-email";

export type EnquiryNotificationStatus =
  | "ACCEPTED"
  | "UNAVAILABLE"
  | "FAILED"
  | "BUSY"
  | "EXHAUSTED"
  | "NOT_FOUND";

type Dependencies = {
  db?: PrismaClient;
  env?: EmailEnvironment;
  send?: typeof sendTransactionalEmail;
  now?: () => Date;
};

/** Provider acceptance is separate from the enquiry already stored in the seller inbox. */
export async function sendEnquiryNotification(
  enquiryId: string,
  dependencies: Dependencies = {},
): Promise<{ status: EnquiryNotificationStatus }> {
  const env = dependencies.env ?? process.env;
  if (!transactionalEmailConfigured(env)) return { status: "UNAVAILABLE" };
  const db = dependencies.db ?? getDb();
  const enquiry = await db.enquiry
    .findUnique({
      where: { id: enquiryId },
      select: {
        id: true,
        createdAt: true,
        notificationStatus: true,
        notificationAttempts: true,
        listing: {
          select: { user: { select: { email: true, emailVerified: true } } },
        },
      },
    })
    .catch((error: unknown) => {
      if (error && typeof error === "object" && "code" in error && error.code === "P2022")
        return undefined;
      throw error;
    });
  if (enquiry === undefined) return { status: "UNAVAILABLE" };
  if (!enquiry) return { status: "NOT_FOUND" };
  if (enquiry.notificationStatus === "ACCEPTED") return { status: "ACCEPTED" };
  const seller = enquiry.listing.user;
  if (!transactionalEmailConfigured(env) || !seller.emailVerified) return { status: "UNAVAILABLE" };
  const now = (dependencies.now ?? (() => new Date()))();
  // Provider idempotency keys expire after 24 hours. Keep ambiguous retries inside
  // that window; an old enquiry remains available in the seller's stored inbox.
  const retryExpired =
    enquiry.notificationAttempts > 0 &&
    enquiry.createdAt.getTime() < now.getTime() - 24 * 60 * 60 * 1000;
  if (enquiry.notificationAttempts >= 5 || retryExpired) return { status: "EXHAUSTED" };
  const claimed = await db.enquiry.updateMany({
    where: {
      id: enquiry.id,
      notificationAttempts: { lt: 5 },
      OR: [
        { notificationStatus: { in: ["PENDING", "FAILED"] } },
        {
          notificationStatus: "SENDING",
          OR: [
            { notificationAttemptedAt: null },
            { notificationAttemptedAt: { lt: new Date(now.getTime() - 15 * 60 * 1000) } },
          ],
        },
      ],
    },
    data: {
      notificationStatus: "SENDING",
      notificationAttemptedAt: now,
      notificationAttempts: { increment: 1 },
    },
  });
  if (!claimed.count) return { status: "BUSY" };
  const claim = {
    id: enquiry.id,
    notificationStatus: "SENDING",
    notificationAttemptedAt: now,
  };
  let accepted: Awaited<ReturnType<typeof sendTransactionalEmail>>;
  try {
    const inbox = new URL("/dashboard", env.BETTER_AUTH_URL).href;
    const digest = createHash("sha256").update(enquiry.id).digest("hex");
    accepted = await (dependencies.send ?? sendTransactionalEmail)(
      {
        to: seller.email,
        subject: "A new enquiry is in your Carpur inbox",
        text: `A buyer has sent an enquiry about one of your Carpur listings.\n\nSign in to your seller dashboard to read the message and contact details:\n${inbox}\n\nThe enquiry remains in your Carpur inbox even if you do not receive this notification.\n\nCarpur`,
        idempotencyKey: `carpur-enquiry-${digest}`,
      },
      { env },
    );
  } catch {
    await db.enquiry.updateMany({
      where: claim,
      data: { notificationStatus: "FAILED" },
    });
    return { status: "FAILED" };
  }
  // A stale worker cannot overwrite the result of a later claim.
  await db.enquiry.updateMany({
    where: claim,
    data: {
      notificationStatus: "ACCEPTED",
      notificationProviderId: accepted.id,
    },
  });
  return { status: "ACCEPTED" };
}
