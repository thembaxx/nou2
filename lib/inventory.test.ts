import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("./examples", () => ({ examples: [] }));
vi.mock("./catalogue", () => ({ catalogue: [] }));
const mocks = vi.hoisted(() => ({ configured: vi.fn(), transaction: vi.fn() }));
vi.mock("./db", () => ({
  databaseConfigured: mocks.configured,
  getDb: () => ({ $transaction: mocks.transaction }),
}));
import { paginatedInventory, parseInventoryQuery } from "./vehicles";
const rows = Array.from({ length: 257 }, (_, index) => ({
  id: `listing-${index}`,
  condition: "USED",
  name: `Vehicle ${index}`,
  make: "Toyota",
  year: 2025,
  price: 100000 + index,
  km: index,
  fuel: 6,
  fuelType: "Petrol",
  transmission: "Manual",
  bodyType: "Hatchback",
  images: [],
  location: "Cape Town",
  sellerType: "PRIVATE",
  sellerName: "Seller",
  description: "Vehicle",
  status: "PUBLISHED",
}));
describe("published inventory pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.configured.mockReturnValue(true);
  });
  it("makes all 257 listings reachable without duplicating page boundaries", async () => {
    const listing = {
      count: vi.fn(async () => rows.length),
      findMany: vi.fn(async ({ skip, take }: { skip: number; take: number }) =>
        rows.slice(skip, skip + take),
      ),
      groupBy: vi.fn(async () => [{ make: "Toyota" }]),
    };
    mocks.transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => fn({ listing }));
    const ids: string[] = [];
    for (let page = 1; page <= 11; page++) {
      const result = await paginatedInventory(
        parseInventoryQuery(new URLSearchParams({ page: String(page) })),
      );
      expect(result.total).toBe(257);
      expect(result.totalPages).toBe(11);
      expect(result.vehicles.length).toBe(page === 11 ? 17 : 24);
      ids.push(...result.vehicles.map((v) => v.id));
    }
    expect(new Set(ids).size).toBe(257);
    expect(ids).toContain("listing-256");
    const clamped = await paginatedInventory(
      parseInventoryQuery(new URLSearchParams({ page: "9999" })),
    );
    expect(clamped.page).toBe(11);
    expect(clamped.hasNext).toBe(false);
    expect(listing.findMany.mock.calls[0][0]).toMatchObject({ skip: 0, take: 24 });
  });
  it("rejects malformed filters before accessing the database", () => {
    const invalid: [string, string][] = [
      ["page", "0"],
      ["page", "1.2"],
      ["condition", "OTHER"],
      ["maxPrice", "-1"],
      ["sort", "sql"],
      ["query", "x".repeat(121)],
    ];
    for (const parameter of invalid)
      expect(() => parseInventoryQuery(new URLSearchParams([parameter]))).toThrow(RangeError);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("does not fabricate an empty healthy inventory when unconfigured", async () => {
    mocks.configured.mockReturnValue(false);
    expect((await paginatedInventory(parseInventoryQuery(new URLSearchParams()))).available).toBe(
      false,
    );
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
