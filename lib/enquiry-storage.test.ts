import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
vi.mock("server-only", () => ({}));
vi.mock("./db", () => ({
  getDb: () => {
    throw Error("Unexpected live database");
  },
}));
import { saveEnquiry, notificationStatuses } from "./enquiry-storage";
describe("stable seller inbox during notification migration", () => {
  it("saves only base columns and parameterizes all buyer input", async () => {
    const input = {
      listingId: "listing",
      buyerId: "buyer",
      message: 'Hello; DROP TABLE "Enquiry"; --',
    };
    const query = vi.fn(async (strings: TemplateStringsArray, ...values: string[]) => {
      expect(strings.join("?")).not.toContain(input.message);
      expect(strings.join("")).not.toContain("notification");
      expect(values.slice(1)).toEqual([input.listingId, input.buyerId, input.message]);
      return [{ id: values[0] }];
    });
    const db = { $queryRaw: query } as unknown as PrismaClient;
    const saved = await saveEnquiry(input, db);
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(query).toHaveBeenCalledOnce();
  });
  it("never claims success when persistence is not confirmed", async () => {
    await expect(
      saveEnquiry({ listingId: "l", buyerId: "b", message: "Test enquiry" }, {
        $queryRaw: vi.fn(async () => []),
      } as unknown as PrismaClient),
    ).rejects.toThrow("could not be confirmed");
  });
  it("optional missing notification status cannot prevent inbox display", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const db = {
        enquiry: {
          findMany: vi.fn(async () => {
            throw Error("Missing optional columns");
          }),
        },
      } as unknown as PrismaClient;
      expect((await notificationStatuses(["saved-enquiry"], db)).size).toBe(0);
    } finally {
      log.mockRestore();
    }
  });
});
