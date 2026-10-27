import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { sendEnquiryNotification } from "./enquiry-notification";
import type { sendTransactionalEmail } from "./transactional-email";

vi.mock("server-only", () => ({}));
vi.mock("./db", () => ({
  getDb: () => {
    throw new Error("Unexpected real database access");
  },
}));

const clock = new Date("2026-10-27T12:00:00.000Z");
const providerId = "623e4567-e89b-42d3-a456-426614174000";
const env = {
  RESEND_API_KEY: "offline-test-key",
  EMAIL_FROM: "Carpur <notifications@example.com>",
  BETTER_AUTH_URL: "https://carpur.example.com",
};
type NotificationRow = {
  id: string;
  createdAt: Date;
  notificationStatus: string;
  notificationAttempts: number;
  notificationAttemptedAt: Date | null;
  notificationProviderId: string | null;
  listing: { user: { email: string; emailVerified: boolean } };
};

function setup(overrides: Partial<NotificationRow> = {}) {
  const row: NotificationRow = {
    id: "authoritative-enquiry-id",
    createdAt: new Date(clock.getTime() - 60_000),
    notificationStatus: "PENDING",
    notificationAttempts: 0,
    notificationAttemptedAt: null,
    notificationProviderId: null,
    listing: { user: { email: "verified-seller@example.com", emailVerified: true } },
    ...overrides,
  };
  const findUnique = vi.fn(async (_args: unknown): Promise<NotificationRow | null> =>
    structuredClone(row),
  );
  // A tiny atomic-claim store models concurrent writes, rather than returning a
  // successful claim to every worker. Final writes require the same lease stamp.
  const updateMany = vi.fn(
    async (args: {
      where: {
        id: string;
        notificationAttempts?: { lt: number };
        notificationStatus?: string;
        notificationAttemptedAt?: Date;
      };
      data: {
        notificationStatus: string;
        notificationAttemptedAt?: Date;
        notificationAttempts?: { increment: number };
        notificationProviderId?: string;
      };
    }) => {
      if (args.where.id !== row.id) return { count: 0 };
      if (args.where.notificationAttempts) {
        const attemptedAt = args.data.notificationAttemptedAt!;
        const available =
          ["PENDING", "FAILED"].includes(row.notificationStatus) ||
          (row.notificationStatus === "SENDING" &&
            (row.notificationAttemptedAt === null ||
              row.notificationAttemptedAt.getTime() < attemptedAt.getTime() - 15 * 60_000));
        if (!available || row.notificationAttempts >= args.where.notificationAttempts.lt)
          return { count: 0 };
        row.notificationStatus = args.data.notificationStatus;
        row.notificationAttemptedAt = attemptedAt;
        row.notificationAttempts += args.data.notificationAttempts!.increment;
        return { count: 1 };
      }
      if (
        row.notificationStatus !== args.where.notificationStatus ||
        row.notificationAttemptedAt?.getTime() !== args.where.notificationAttemptedAt?.getTime()
      )
        return { count: 0 };
      row.notificationStatus = args.data.notificationStatus;
      if (args.data.notificationProviderId)
        row.notificationProviderId = args.data.notificationProviderId;
      return { count: 1 };
    },
  );
  const db = { enquiry: { findUnique, updateMany } } as unknown as PrismaClient;
  const send = vi
    .fn<typeof sendTransactionalEmail>()
    .mockResolvedValue({ id: providerId, status: "accepted" });
  return { row, findUnique, updateMany, send, dependencies: { db, env, send, now: () => clock } };
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("Unexpected real email/network request");
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("enquiry notification delivery boundary", () => {
  it("uses the database-verified seller address and keeps buyer details out of the email", async () => {
    const subject = setup();
    expect(await sendEnquiryNotification(subject.row.id, subject.dependencies)).toEqual({
      status: "ACCEPTED",
    });
    expect(subject.findUnique.mock.calls[0][0]).toMatchObject({
      where: { id: subject.row.id },
      select: { listing: { select: { user: { select: { email: true, emailVerified: true } } } } },
    });
    const email = subject.send.mock.calls[0][0];
    expect(email.to).toBe(subject.row.listing.user.email);
    expect(email.text).toContain("https://carpur.example.com/dashboard");
    expect(email.text).not.toContain(subject.row.id);
    expect(email.subject).toBe("A new enquiry is in your Carpur inbox");
    expect(email.idempotencyKey).toMatch(/^carpur-enquiry-[0-9a-f]{64}$/);
    expect(subject.row.notificationStatus).toBe("ACCEPTED");
    expect(subject.row.notificationProviderId).toBe(providerId);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not claim or send when email configuration is missing or the seller is unverified", async () => {
    for (const configured of [false, true]) {
      const subject = setup({
        listing: { user: { email: "seller@example.com", emailVerified: !configured } },
      });
      const dependencies = { ...subject.dependencies, env: configured ? env : {} };
      expect(await sendEnquiryNotification(subject.row.id, dependencies)).toEqual({
        status: "UNAVAILABLE",
      });
      expect(subject.send).not.toHaveBeenCalled();
      expect(subject.updateMany).not.toHaveBeenCalled();
      expect(subject.row.notificationAttempts).toBe(0);
    }
  });

  it("concurrent attempts acquire one claim and send one notification", async () => {
    const subject = setup();
    const outcomes = await Promise.all([
      sendEnquiryNotification(subject.row.id, subject.dependencies),
      sendEnquiryNotification(subject.row.id, subject.dependencies),
    ]);
    expect(outcomes.map((result) => result.status).sort()).toEqual(["ACCEPTED", "BUSY"]);
    expect(subject.send).toHaveBeenCalledTimes(1);
    expect(subject.row.notificationAttempts).toBe(1);
    expect(subject.row.notificationStatus).toBe("ACCEPTED");
  });

  it("provider failure remains FAILED, and a retry reuses the same idempotency key", async () => {
    const subject = setup();
    subject.send.mockRejectedValueOnce(new Error("Provider timed out after an ambiguous response"));
    expect(await sendEnquiryNotification(subject.row.id, subject.dependencies)).toEqual({
      status: "FAILED",
    });
    expect(subject.row.notificationStatus).toBe("FAILED");
    expect(subject.row.notificationProviderId).toBeNull();
    expect(await sendEnquiryNotification(subject.row.id, subject.dependencies)).toEqual({
      status: "ACCEPTED",
    });
    expect(subject.send).toHaveBeenCalledTimes(2);
    expect(subject.send.mock.calls[0][0].idempotencyKey).toBe(
      subject.send.mock.calls[1][0].idempotencyKey,
    );
    expect(subject.row.notificationAttempts).toBe(2);
    expect(subject.row.notificationStatus).toBe("ACCEPTED");
  });

  it("an accepted notification is idempotent and never claims delivery to the inbox", async () => {
    const subject = setup({ notificationStatus: "ACCEPTED", notificationProviderId: providerId });
    expect(await sendEnquiryNotification(subject.row.id, subject.dependencies)).toEqual({
      status: "ACCEPTED",
    });
    expect(subject.send).not.toHaveBeenCalled();
    expect(subject.updateMany).not.toHaveBeenCalled();
  });

  it("a recent send lease is busy and a stale lease can be reclaimed", async () => {
    const recent = setup({
      notificationStatus: "SENDING",
      notificationAttempts: 1,
      notificationAttemptedAt: new Date(clock.getTime() - 60_000),
    });
    expect(await sendEnquiryNotification(recent.row.id, recent.dependencies)).toEqual({
      status: "BUSY",
    });
    expect(recent.send).not.toHaveBeenCalled();
    const stale = setup({
      notificationStatus: "SENDING",
      notificationAttempts: 1,
      notificationAttemptedAt: new Date(clock.getTime() - 16 * 60_000),
    });
    expect(await sendEnquiryNotification(stale.row.id, stale.dependencies)).toEqual({
      status: "ACCEPTED",
    });
    expect(stale.send).toHaveBeenCalledTimes(1);
    expect(stale.row.notificationAttempts).toBe(2);
  });

  it("exhausts retries before the provider idempotency window expires", async () => {
    for (const overrides of [
      { notificationAttempts: 5 },
      { notificationAttempts: 1, createdAt: new Date(clock.getTime() - 25 * 60 * 60_000) },
    ]) {
      const subject = setup(overrides);
      expect(await sendEnquiryNotification(subject.row.id, subject.dependencies)).toEqual({
        status: "EXHAUSTED",
      });
      expect(subject.send).not.toHaveBeenCalled();
      expect(subject.updateMany).not.toHaveBeenCalled();
    }
  });

  it("an old worker cannot overwrite a newer claim's notification status", async () => {
    const subject = setup();
    subject.send.mockImplementationOnce(async () => {
      subject.row.notificationAttemptedAt = new Date(clock.getTime() + 16 * 60_000);
      subject.row.notificationStatus = "ACCEPTED";
      subject.row.notificationProviderId = "newer-worker-provider-id";
      return { id: providerId, status: "accepted" };
    });
    expect(await sendEnquiryNotification(subject.row.id, subject.dependencies)).toEqual({
      status: "ACCEPTED",
    });
    expect(subject.row.notificationProviderId).toBe("newer-worker-provider-id");
  });

  it("a missing stored enquiry cannot trigger an email", async () => {
    const subject = setup();
    subject.findUnique.mockResolvedValueOnce(null);
    expect(await sendEnquiryNotification("missing-id", subject.dependencies)).toEqual({
      status: "NOT_FOUND",
    });
    expect(subject.send).not.toHaveBeenCalled();
    expect(subject.updateMany).not.toHaveBeenCalled();
  });
  it("missing notification columns leave the existing inbox available without a send", async () => {
    const subject = setup();
    subject.findUnique.mockRejectedValueOnce(
      Object.assign(new Error("Column missing"), { code: "P2022" }),
    );
    expect(await sendEnquiryNotification(subject.row.id, subject.dependencies)).toEqual({
      status: "UNAVAILABLE",
    });
    expect(subject.send).not.toHaveBeenCalled();
    expect(subject.updateMany).not.toHaveBeenCalled();
  });
});
