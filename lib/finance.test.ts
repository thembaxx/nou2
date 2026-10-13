import { describe, it, expect } from "vitest";
import { monthlyPayment, forecast, budgetHeadroom, type FinanceInput } from "./finance";
const base: FinanceInput = {
  price: 200000,
  deposit: 20000,
  annualRate: 12,
  months: 60,
  balloon: 0,
  distanceKm: 12000,
  litresPer100Km: 7,
  fuelPrice: 24,
  insuranceMonthly: 800,
  maintenanceMonthly: 500,
  depreciationAnnual: 10,
};
describe("fixed-rate finance", () => {
  it("matches a known amortisation schedule", () =>
    expect(monthlyPayment(300000, 30000, 12, 72)).toBeCloseTo(5278.55, 2));
  it("handles an interest-free loan", () =>
    expect(monthlyPayment(120000, 20000, 0, 20)).toBe(5000));
  it("handles a cash purchase", () => expect(monthlyPayment(120000, 120000, 12, 60)).toBe(0));
  it("reduces instalments for a balloon without cancelling the debt", () => {
    expect(monthlyPayment(200000, 20000, 12, 60, 50000)).toBeLessThan(
      monthlyPayment(200000, 20000, 12, 60),
    );
    expect(forecast({ ...base, balloon: 50000 }, 3).balance).toBeGreaterThan(50000);
  });
  it.each([
    [200000, 210000, 12, 60, 0],
    [200000, -1, 12, 60, 0],
    [200000, 20000, 12, 0, 0],
    [200000, 20000, 12, 1.5, 0],
    [200000, 20000, 12, 60, 190000],
    [NaN, 0, 12, 60, 0],
    [200000, 0, Infinity, 60, 0],
  ])("rejects invalid loan input %#", (...args) =>
    expect(() => monthlyPayment(...(args as [number, number, number, number, number]))).toThrow(
      RangeError,
    ),
  );
});
describe("ownership forecasting", () => {
  it("calculates fuel independently", () => expect(forecast(base).fuel).toBe(1680));
  it("includes PHEV charging separately from petrol at every horizon", () => {
    const baseline = forecast(base, 3);
    const phev = forecast({ ...base, chargingMonthly: 450 }, 3);
    expect(phev.fuel - baseline.fuel).toBe(450);
    expect(phev.cash - baseline.cash).toBe(450 * 36);
    expect(phev.economic - baseline.economic).toBeCloseTo(450 * 36);
  });
  it("prices electric consumption in kWh rather than petrol units", () => {
    expect(forecast({ ...base, litresPer100Km: 16, fuelPrice: 4 }).fuel).toBe(640);
  });
  it("rejects nonfinite and negative charging costs", () => {
    for (const chargingMonthly of [-1, Infinity, NaN])
      expect(() => forecast({ ...base, chargingMonthly })).toThrow();
  });
  it("keeps the economic cost identity", () => {
    const x = forecast(base, 3);
    expect(x.economic).toBeCloseTo(x.cash + x.balance - x.resale);
    expect(x.economic).toBeCloseTo(x.depreciation + x.interest + x.runningCash);
  });
  it("pays a balloon once at maturity", () => {
    const loan = { ...base, annualRate: 0, months: 36, balloon: 60000 };
    const before = forecast(loan, 1);
    const at = forecast(loan, 3);
    const after = forecast(loan, 5);
    expect(before.balloonPaid).toBe(0);
    expect(before.balance).toBe(140000);
    expect(at.balloonPaid).toBe(60000);
    expect(at.balance).toBe(0);
    expect(at.financeCash).toBe(180000);
    expect(after.financeCash).toBe(at.financeCash);
    expect(after.balance).toBe(0);
  });
  it("stops repayments after loan term while running costs continue", () => {
    const a = forecast({ ...base, months: 12 }, 1),
      b = forecast({ ...base, months: 12 }, 5);
    expect(b.financeCash).toBeCloseTo(a.financeCash);
    expect(b.runningCash).toBeCloseTo(a.runningCash * 5);
  });
  it("handles full depreciation", () =>
    expect(forecast({ ...base, depreciationAnnual: 100 }).resale).toBe(0));
  it("does not count depreciation twice on a cash purchase", () => {
    const x = forecast({ ...base, deposit: base.price }, 3);
    expect(x.interest).toBe(0);
    expect(x.economic).toBeCloseTo(x.depreciation + x.runningCash);
  });
  it.each([{ fuelPrice: -1 }, { distanceKm: NaN }, { depreciationAnnual: 101 }])(
    "rejects invalid running costs %#",
    (invalid) => expect(() => forecast({ ...base, ...invalid })).toThrow(),
  );
  it("rejects invalid horizon", () => expect(() => forecast(base, 0)).toThrow());
});
describe("budget headroom", () => {
  it("shows negative remaining cash rather than a credit score", () =>
    expect(budgetHeadroom(10000, 9000, 2000).remaining).toBe(-1000));
  it("has no undefined percentage when disposable income is zero", () =>
    expect(budgetHeadroom(10000, 12000, 2000).share).toBeNull());
});
