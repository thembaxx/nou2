import { it, expect } from "vitest";
import { matchingRealModel } from "./real-models";
it("does not present a different BMW generation as a 320i", () => {
  expect(
    matchingRealModel({ make: "BMW", name: "BMW 320i M Sport", year: 2022, bodyType: "Sedan" }),
  ).toBeNull();
});
it("does not substitute a 2021 model for unknown or newer Corolla Cross trims", () => {
  for (const year of [0, 2023, 2026])
    expect(
      matchingRealModel({ make: "Toyota", name: "Toyota Corolla Cross", year, bodyType: "SUV" }),
    ).toBeNull();
});
it("matches known model families without claiming a scan of seller stock", () => {
  expect(
    matchingRealModel({ make: "BMW", name: "BMW M3 E30", year: 1990, bodyType: "Coupe" }),
  ).toBe("bmw-m3-e30");
  expect(
    matchingRealModel({
      make: "Ferrari",
      name: "Ferrari 458 Italia",
      year: 2010,
      bodyType: "Coupe",
    }),
  ).toBeNull();
});
