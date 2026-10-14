"use client";
import {
  FUEL_TYPES,
  energyUnit,
  planningConsumption,
  planningEnergyPrice,
} from "@/lib/vehicle-options";
import { useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { AdaptiveCostChart } from "./adaptive-cost-chart";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { forecast, budgetHeadroom, zar, type FinanceInput } from "@/lib/finance";

export function FinanceTool({ vehicles, initialId }: { vehicles: Vehicle[]; initialId?: string }) {
  const [id, setId] = useState(initialId || vehicles[0]?.id);
  const vehicle = vehicles.find((v) => v.id === id);
  const [customFuelType, setCustomFuelType] = useState("Petrol");
  const selectedFuelType = vehicle?.fuelType || customFuelType;
  const [price, setPrice] = useState(vehicle?.price || 300000);
  const [deposit, setDeposit] = useState(Math.round(price * 0.1));
  const [rate, setRate] = useState(12);
  const [term, setTerm] = useState(72);
  const [balloon, setBalloon] = useState(0);
  const [distance, setDistance] = useState(15000);
  const [consumption, setConsumption] = useState(planningConsumption(vehicle));
  const [fuelPrice, setFuelPrice] = useState(planningEnergyPrice(vehicle?.fuelType));
  const [charging, setCharging] = useState(vehicle?.fuelType === "Plug-in Hybrid" ? 450 : 0);
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
    chargingMonthly: charging,
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
  const stress = result
    ? forecast(
        {
          ...input,
          annualRate: Math.min(100, rate + 2),
          fuelPrice: fuelPrice * 1.2,
          chargingMonthly: charging * 1.2,
          insuranceMonthly: insurance * 1.2,
          maintenanceMonthly: maintenance * 1.3,
          depreciationAnnual: Math.min(100, depreciation + 5),
        },
        years,
      )
    : null;
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
      <div className="squircle-panel light border border-[#ccd0d7] p-5 sm:p-6 md:p-8">
        <h2 className="mb-6 text-2xl font-bold">Your assumptions</h2>
        <label className="label mb-6">
          Vehicle
          <select
            className="field"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              const next = vehicles.find((v) => v.id === e.target.value);
              if (!next) {
                setConsumption(7);
                setFuelPrice(24);
                setCharging(0);
                setCustomFuelType("Petrol");
              }
              if (next) {
                setId(next.id);
                setPrice(next.price);
                setDeposit(Math.round(next.price * 0.1));
                setBalloon(0);
                setConsumption(planningConsumption(next));
                setFuelPrice(planningEnergyPrice(next.fuelType));
                setCharging(next.fuelType === "Plug-in Hybrid" ? 450 : 0);
              }
            }}
          >
            <option value="custom">Custom vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.example ? " (illustrative)" : v.reference ? " (manufacturer reference)" : ""}
              </option>
            ))}
          </select>
        </label>
        {!vehicle && (
          <label className="label mb-6">
            Custom Powertrain
            <select
              aria-label="Custom powertrain"
              className="field"
              value={customFuelType}
              onChange={(e) => {
                const type = e.target.value;
                setCustomFuelType(type);
                setFuelPrice(planningEnergyPrice(type));
                setConsumption(type === "Electric" ? 18 : type === "Hydrogen" ? 1 : 7);
                setCharging(type === "Plug-in Hybrid" ? 450 : 0);
              }}
            >
              {FUEL_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {number(
            "Vehicle price (R)",
            price,
            (v) => {
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
          {number(
            `Consumption (${energyUnit(selectedFuelType)} / 100 km)`,
            consumption,
            setConsumption,
            100,
            0.1,
          )}
          {number(
            `Fuel / Energy Price (R/${energyUnit(selectedFuelType)})`,
            fuelPrice,
            setFuelPrice,
            500,
            0.01,
          )}
          {number("Additional Monthly Charging (R)", charging, setCharging, 50000)}
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
        {selectedFuelType === "Plug-in Hybrid" && (
          <p className="notice mt-6">
            Plug-in hybrid lab consumption assumes charging and can understate real costs. Planning
            starts at 7 L/100 km plus R450/month charging, both illustrative. Replace these with
            your driving and charging estimates.
          </p>
        )}
        {vehicle?.reference && !vehicle.reference.consumptionAvailable && (
          <p className="notice mt-6">
            The manufacturer did not publish consumption for this model. The 7 L/100 km planning
            value is an editable assumption.
          </p>
        )}
        <p className="mt-6 text-xs leading-relaxed text-slate-600">
          Defaults are illustrative, not current rates or quotations. Include rent, groceries, debt
          and other essentials in commitments. For electric vehicles use kWh/100 km and R/kWh
          consistently.
        </p>
        <Link href="/sources" className="mt-4 inline-block text-sm text-blue-700 underline">
          Read the methodology & official sources
        </Link>
      </div>
      <div className="panel p-5 sm:p-6 md:p-8" aria-live="polite">
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
              {balloon > 0 && (
                <p className="notice mt-6">
                  A final balloon of {zar(balloon)} is due after {term} months. The monthly figure
                  excludes this lump sum. Saving {zar(balloon / term)} per month would fund it over
                  the term, assuming no investment return. Refinancing and resale proceeds are not
                  guaranteed.
                </p>
              )}
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
              {stress && (
                <div className="notice my-7">
                  <h3 className="font-semibold">If Costs Rise</h3>
                  <p className="mt-2 text-xl font-bold">{zar(stress.monthly)} / month</p>
                  <p className="mt-2 text-xs">
                    Scenario: interest +2 percentage points, energy and insurance +20%, maintenance
                    +30%. With depreciation +5 points, {years}-year net cost becomes{" "}
                    {zar(stress.economic)}. This is a stress scenario, not a probability or market
                    forecast.
                  </p>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                {vehicle && !vehicle.example && (
                  <Link
                    className="squircle-button inline-flex min-h-12 items-center gap-2 bg-blue-600 px-5 text-sm font-semibold text-white"
                    href={vehicle.reference?.url || `/vehicles/${vehicle.id}`}
                    target={vehicle.reference ? "_blank" : undefined}
                    rel={vehicle.reference ? "noreferrer" : undefined}
                  >
                    {vehicle.reference ? "Get A Dealer Quote" : "Contact The Seller"}
                    {vehicle.reference && (
                      <ArrowUpRightIcon aria-hidden="true" focusable="false" size={16} />
                    )}
                  </Link>
                )}
                <Link
                  className="inline-flex min-h-12 items-center text-sm text-blue-200 underline"
                  href="/marketplace"
                >
                  Find A Car Within Your Budget
                </Link>
              </div>
              <AdaptiveCostChart
                data={projections.map((v) => ({ horizon: v.horizon, cost: v.economic }))}
              />
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Ownership cost projections"
              >
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
