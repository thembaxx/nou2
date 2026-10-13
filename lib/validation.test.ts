import { describe, it, expect } from "vitest";
import { listingSchema, enquirySchema } from "./validation";
const valid = {
  name: "BMW 320i",
  make: "BMW",
  year: 2022,
  price: 200000,
  km: 50000,
  fuel: 7,
  fuelType: "Petrol",
  transmission: "Automatic",
  bodyType: "Sedan",
  images: ["https://example.com/car.webp"],
  location: "Cape Town",
  sellerType: "PRIVATE",
  sellerName: "Test seller",
  description: "An accurate description of this actual vehicle.",
  status: "DRAFT",
};
describe("listing boundaries", () => {
  it("accepts complete listings", () => expect(listingSchema.safeParse(valid).success).toBe(true));
  it.each([
    { price: -1 },
    { images: [] },
    { images: ["javascript:alert(1)"] },
    { images: ["data:image/svg+xml;base64,PHN2Zz4="] },
    { sellerType: "VERIFIED" },
    { year: 1800 },
    { description: "short" },
  ])("rejects invalid listing %#", (input) =>
    expect(listingSchema.safeParse({ ...valid, ...input }).success).toBe(false),
  );
  it("requires contact-sharing consent for enquiries", () =>
    expect(
      enquirySchema.safeParse({ message: "Is this vehicle available?", consent: false }).success,
    ).toBe(false));
});
