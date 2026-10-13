"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { forecast, budgetHeadroom, zar, type FinanceInput } from "@/lib/finance";
const CostChart = dynamic(() => import("./cost-chart"), {
  ssr: false,
  loading: () => <div className="h-64" />,
});
export function FinanceTool({ vehicles, initialId }: { vehicles: Vehicle[]; initialId?: string }) {
  const [id, setId] = useState(initialId || vehicles[0]?.id);
  const vehicle = vehicles.find((v) => v.id === id) || vehicles[0];
  const [price, setPrice] = useState(vehicle?.price || 300000);
  const [deposit, setDeposit] = useState(Math.round(price * 0.1));
  const [rate, setRate] = useState(12);
  const [term, setTerm] = useState(72);
  const [balloon, setBalloon] = useState(0);
  const [distance, setDistance] = useState(15000);
  const [consumption, setConsumption] = useState(vehicle?.fuel || 7);
  const [fuelPrice, setFuelPrice] = useState(24);
  const [insurance, setInsurance] = useState(1500);
  const [maintenance, setMaintenance] = useState(900);
  const [depreciation, setDepreciation] = useState(12);
  const [income, setIncome] = useState(45000);
  const [commitments, setCommitments] = useState(20000);
  const [years, setYears] = useState(3);
  const input: FinanceInput = {
    price,
    deposit,
    annualRate: rate,
    months: term,
    balloon,
    distanceKm: distance,
    litresPer100Km: consumption,
    fuelPrice,
    insuranceMonthly: insurance,
    maintenanceMonthly: maintenance,
    depreciationAnnual: depreciation,
  };
  let error = "";
  let result: ReturnType<typeof forecast> | undefined;
  try {
    result = forecast(input, years);
  } catch (e) {
    error = e instanceof Error ? e.message : "Check your assumptions.";
  }
  const budget = result ? budgetHeadroom(income, commitments, result.monthly) : null;
  const projections = result
    ? [1, 3, 5].map((n) => ({ horizon: `${n} year${n > 1 ? "s" : ""}`, ...forecast(input, n) }))
    : [];
  function number(
    label: string,
    value: number,
    setter: (v: number) => void,
    max: number,
    step = 1,
  ) {
    return (
      <label className="label">
        {label}
        <input
          className="field"
          type="number"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setter(Math.max(0, Number(e.target.value) || 0))}
        />
      </label>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <div className="light border border-[#ccd0d7] p-6 md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Your assumptions</h2>
        <label className="label mb-6">
          Vehicle
          <select
            className="field"
            value={id}
            onChange={(e) => {
              const next = vehicles.find((v) => v.id === e.target.value);
              if (next) {
                setId(next.id);
                setPrice(next.price);
                setDeposit(Math.round(next.price * 0.1));
                setBalloon(0);
                setConsumption(next.fuel);
              }
            }}
          >
            <option value="custom">Custom vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.example ? " (illustrative)" : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          {number(
            "Vehicle price (R)",
            price,
            (v) => {
              setId("custom");
              setPrice(v);
            },
            10000000,
          )}
          {number("Deposit (R)", deposit, setDeposit, price)}
          {number("Annual interest (%)", rate, setRate, 100, 0.1)}
          <label className="label">
            Finance term
            <select
              className="field"
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
            >
              {[12, 24, 36, 48, 60, 72, 84, 96].map((v) => (
                <option key={v} value={v}>
                  {v} months
                </option>
              ))}
            </select>
          </label>
          {number("Balloon / residual payment (R)", balloon, setBalloon, price - deposit)}
          {number("Annual distance (km)", distance, setDistance, 150000)}
          {number("Consumption (L or kWh / 100 km)", consumption, setConsumption, 60, 0.1)}
          {number("Fuel / energy price (R per L or kWh)", fuelPrice, setFuelPrice, 100, 0.01)}
          {number("Monthly insurance (R)", insurance, setInsurance, 50000)}
          {number("Monthly maintenance & tyres (R)", maintenance, setMaintenance, 50000)}
          {number("Annual depreciation (%)", depreciation, setDepreciation, 100, 0.1)}
          {number("Net monthly income (R)", income, setIncome, 1000000)}
          {number(
            "Living costs & other repayments (R/month)",
            commitments,
            setCommitments,
            1000000,
          )}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-slate-600">
          Defaults are illustrative, not current rates or quotations. Include rent, groceries, debt
          and other essentials in commitments. For electric vehicles use kWh/100 km and R/kWh
          consistently.
        </p>
        <Link href="/sources" className="mt-4 inline-block text-sm text-blue-700 underline">
          Read the methodology & official sources
        </Link>
      </div>
      <div className="panel p-6 md:p-8" aria-live="polite">
        {error ? (
          <p className="notice" role="alert">
            {error}
          </p>
        ) : (
          result && (
            <>
              <p className="eyebrow mb-6">Your ownership forecast</p>
              <p className="text-sm text-slate-400">Monthly cash outflow during finance</p>
              <p className="mt-2 text-[clamp(36px,5vw,66px)] font-black leading-none tracking-[-.05em]">
                {zar(result.monthly)}
              </p>
              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-6">
                {[
                  ["Finance instalment", result.instalment],
                  ["Fuel / energy", result.fuel],
                  ["Insurance", insurance],
                  ["Maintenance & tyres", maintenance],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-slate-400">{label}</dt>
                    <dd className="mt-1 text-xl font-bold">{zar(Number(value))}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex gap-2" aria-label="Forecast horizon">
                {[1, 3, 5].map((n) => (
                  <button
                    className={`border px-4 py-2 text-sm ${years === n ? "bg-white text-black" : "border-white/30"}`}
                    aria-pressed={years === n}
                    key={n}
                    onClick={() => setYears(n)}
                  >
                    {n} year{n > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
              <dl className="my-7 grid grid-cols-2 gap-5">
                {[
                  [`${years}-year cash outflow`, result.cash],
                  ["Estimated resale", result.resale],
                  ["Outstanding debt", result.balance],
                  ["Balloon paid by horizon", result.balloonPaid],
                  ["Finance interest", result.interest],
                  ["Depreciation", result.depreciation],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-slate-400">{label}</dt>
                    <dd className="mt-1 text-lg font-semibold">{zar(Number(value))}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-slate-400">{years}-year net ownership cost</p>
              <p className="mt-1 text-4xl font-bold text-blue-300">{zar(result.economic)}</p>
              <p className="mt-2 text-xs text-slate-400">
                Cash outflow + outstanding debt − estimated resale. Depreciation is included through
                resale.
              </p>
              {budget && (
                <div className="notice my-7">
                  <p className="text-sm">Monthly budget remaining after this vehicle</p>
                  <p
                    className={`mt-1 text-3xl font-bold ${budget.remaining < 0 ? "text-red-300" : "text-white"}`}
                  >
                    {zar(budget.remaining)}
                  </p>
                  <p className="mt-2 text-xs">
                    {budget.remaining < 0
                      ? "Your estimated outgoings exceed your net income."
                      : "Keep room for unexpected repairs and income changes."}{" "}
                    This is a cash-flow estimate, not a credit score or finance approval.
                  </p>
                </div>
              )}
              <CostChart
                data={projections.map((v) => ({ horizon: v.horizon, cost: v.economic }))}
              />
              <div className="overflow-x-auto">
                <table className="text-sm">
                  <caption className="pb-3 text-left text-xs text-slate-400">
                    Net ownership cost at each horizon
                  </caption>
                  <thead>
                    <tr>
                      <th>Horizon</th>
                      <th>Cash outflow</th>
                      <th>Net cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.map((v) => (
                      <tr key={v.horizon}>
                        <td>{v.horizon}</td>
                        <td>{zar(v.cash)}</td>
                        <td>{zar(v.economic)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
