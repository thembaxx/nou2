export type FinanceInput = {
  price: number;
  deposit: number;
  annualRate: number;
  months: number;
  balloon?: number;
  distanceKm: number;
  litresPer100Km: number;
  fuelPrice: number;
  insuranceMonthly: number;
  maintenanceMonthly: number;
  depreciationAnnual: number;
};
function finiteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0)
    throw new RangeError(`${name} must be non-negative and finite`);
}
function validateLoan(
  price: number,
  deposit: number,
  annualRate: number,
  months: number,
  balloon: number,
) {
  for (const [name, value] of Object.entries({ price, deposit, annualRate, balloon }))
    finiteNonNegative(value, name);
  if (!Number.isInteger(months) || months < 1 || months > 120)
    throw new RangeError("Term must be 1–120 whole months");
  if (deposit > price) throw new RangeError("Deposit cannot exceed price");
  if (balloon > price - deposit) throw new RangeError("Balloon cannot exceed financed principal");
  if (annualRate > 100) throw new RangeError("Annual rate cannot exceed 100%");
}
export function monthlyPayment(
  price: number,
  deposit: number,
  annualRate: number,
  months: number,
  balloon = 0,
) {
  validateLoan(price, deposit, annualRate, months, balloon);
  const principal = price - deposit;
  const rate = annualRate / 1200;
  if (rate === 0) return (principal - balloon) / months;
  const discount = Math.pow(1 + rate, -months);
  return ((principal - balloon * discount) * rate) / (1 - discount);
}
export function forecast(x: FinanceInput, years = 3) {
  if (!Number.isFinite(years) || years <= 0 || years > 10)
    throw new RangeError("Horizon must be 0–10 years");
  for (const key of [
    "distanceKm",
    "litresPer100Km",
    "fuelPrice",
    "insuranceMonthly",
    "maintenanceMonthly",
    "depreciationAnnual",
  ] as const)
    finiteNonNegative(x[key], key);
  if (x.depreciationAnnual > 100) throw new RangeError("Depreciation cannot exceed 100%");
  const balloon = x.balloon ?? 0;
  const instalment = monthlyPayment(x.price, x.deposit, x.annualRate, x.months, balloon);
  const fuel = (((x.distanceKm * x.litresPer100Km) / 100) * x.fuelPrice) / 12;
  const runningMonthly = fuel + x.insuranceMonthly + x.maintenanceMonthly;
  const horizonMonths = Math.round(years * 12);
  const paidMonths = Math.min(horizonMonths, x.months);
  const rate = x.annualRate / 1200;
  const factor = Math.pow(1 + rate, paidMonths);
  const outstanding = Math.max(
    0,
    (x.price - x.deposit) * factor - instalment * (rate === 0 ? paidMonths : (factor - 1) / rate),
  );
  const balloonPaid = horizonMonths >= x.months ? balloon : 0;
  const balance = horizonMonths >= x.months ? 0 : outstanding;
  const resale = x.price * Math.pow(1 - x.depreciationAnnual / 100, years);
  const financeCash = instalment * paidMonths + balloonPaid;
  const interest = Math.max(0, financeCash + balance - (x.price - x.deposit));
  const runningCash = runningMonthly * horizonMonths;
  const cash = x.deposit + financeCash + runningCash;
  const depreciation = x.price - resale;
  const economic = cash + balance - resale;
  return {
    instalment,
    fuel,
    monthly: instalment + runningMonthly,
    runningMonthly,
    cash,
    financeCash,
    runningCash,
    resale,
    balance,
    economic,
    interest,
    depreciation,
    balloonPaid,
    horizonMonths,
  };
}
export function budgetHeadroom(income: number, commitments: number, vehicleMonthly: number) {
  for (const [name, value] of Object.entries({ income, commitments, vehicleMonthly }))
    finiteNonNegative(value, name);
  const disposable = Math.max(0, income - commitments);
  return {
    disposable,
    remaining: income - commitments - vehicleMonthly,
    share: disposable > 0 ? (vehicleMonthly / disposable) * 100 : null,
  };
}
export const zar = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
