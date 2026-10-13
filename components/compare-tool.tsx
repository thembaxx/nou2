"use client";
import { PhotoCredit } from "./photo-credit";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { forecast, zar } from "@/lib/finance";
const CostChart = dynamic(() => import("./cost-chart"), { ssr: false });
export function CompareTool({
  vehicles,
  initialIds = [],
}: {
  vehicles: Vehicle[];
  initialIds?: string[];
}) {
  const [first, setFirst] = useState(initialIds[0] || vehicles[0]?.id || "");
  const [second, setSecond] = useState(initialIds[1] || vehicles[1]?.id || "");
  const [rate, setRate] = useState(12);
  const [deposit, setDeposit] = useState(10);
  const [term, setTerm] = useState(72);
  const [balloon, setBalloon] = useState(0);
  const [distance, setDistance] = useState(15000);
  const [fuelPrice, setFuelPrice] = useState(24);
  const [insurance, setInsurance] = useState(1500);
  const [maintenance, setMaintenance] = useState(900);
  const [depreciation, setDepreciation] = useState(12);
  const pair = [vehicles.find((v) => v.id === first), vehicles.find((v) => v.id === second)];
  const error =
    first === second
      ? "Choose two different vehicles."
      : deposit + balloon > 100
        ? "Deposit and balloon percentages must total 100% or less."
        : pair.some((v) => !v)
          ? "Select two vehicles to compare."
          : "";
  const costs = (v: Vehicle, years: number) =>
    forecast(
      {
        price: v.price,
        deposit: (v.price * deposit) / 100,
        balloon: (v.price * balloon) / 100,
        annualRate: rate,
        months: term,
        distanceKm: distance,
        litresPer100Km: v.fuel,
        fuelPrice,
        insuranceMonthly: insurance,
        maintenanceMonthly: maintenance,
        depreciationAnnual: depreciation,
      },
      years,
    );
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
          min="0"
          max={max}
          step={step}
          value={value}
          onChange={(e) => setter(Math.min(max, Math.max(0, Number(e.target.value) || 0)))}
        />
      </label>
    );
  }
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        {pair.map((v, i) => (
          <div className="panel p-5" key={i}>
            <label className="label">
              Vehicle {i + 1}
              <select
                className="field"
                value={i === 0 ? first : second}
                onChange={(e) => (i === 0 ? setFirst : setSecond)(e.target.value)}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name}
                    {car.example ? " (illustrative)" : ""}
                  </option>
                ))}
              </select>
            </label>
            {v && (
              <>
                <img
                  className="mt-5 h-56 w-full object-cover"
                  src={v.images[0]}
                  alt={v.example ? `Editorial image for ${v.name} example` : v.name}
                  width={800}
                  height={500}
                />
                <h2 className="mt-5 text-2xl font-bold">{v.name}</h2>
                <p className="mt-2 text-slate-400">
                  {zar(v.price)} · {v.fuel} {v.fuelType === "Electric" ? "kWh" : "L"}/100 km
                </p>
                {v.example && (
                  <p className="mt-3 text-xs text-blue-300">Illustrative · not for sale</p>
                )}
                <PhotoCredit id={v.id} />
              </>
            )}
          </div>
        ))}
      </div>
      <details className="panel my-6 p-6" open>
        <summary className="cursor-pointer text-lg font-semibold">
          Shared financial assumptions
        </summary>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {number("Deposit (% of price)", deposit, setDeposit, 100)}
          {number("Annual interest (%)", rate, setRate, 100, 0.1)}
          <label className="label">
            Term
            <select
              className="field"
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
            >
              {[12, 24, 36, 48, 60, 72, 84, 96].map((n) => (
                <option key={n} value={n}>
                  {n} months
                </option>
              ))}
            </select>
          </label>
          {number("Balloon (% of price)", balloon, setBalloon, 100)}
          {number("Annual distance (km)", distance, setDistance, 150000)}
          {number("Fuel / energy price (R per unit)", fuelPrice, setFuelPrice, 100, 0.01)}
          {number("Insurance (R/month)", insurance, setInsurance, 50000)}
          {number("Maintenance (R/month)", maintenance, setMaintenance, 50000)}
          {number("Annual depreciation (%)", depreciation, setDepreciation, 100, 0.1)}
        </div>
        <p className="mt-5 text-xs text-slate-400">
          Illustrative defaults. Both cars use the same rate, deposit percentage and running-cost
          allowances to make differences clear. Use individual vehicle calculators for separate
          quotes. Fuel and electric energy units differ: compare matching fuel types here, or use
          separate calculators with R/kWh and R/litre.
        </p>
      </details>
      {error ? (
        <p role="alert" className="notice">
          {error}
        </p>
      ) : (
        pair[0] &&
        pair[1] && (
          <>
            <div className="panel p-6">
              <h2 className="mb-5 text-2xl font-bold">The long view</h2>
              <CostChart
                data={[1, 3, 5].map((n) => ({
                  horizon: `${n} years`,
                  cost: costs(pair[0]!, n).economic,
                  second: costs(pair[1]!, n).economic,
                }))}
              />
              <div className="overflow-x-auto">
                <table className="text-sm">
                  <caption className="py-4 text-left text-xs text-slate-400">
                    Projections in rand. Vehicle 1: {pair[0].name}. Vehicle 2: {pair[1].name}.
                  </caption>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>{pair[0].name}</th>
                      <th>{pair[1].name}</th>
                      <th>Vehicle 2 − vehicle 1</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Monthly cash during finance</th>
                      <td>{zar(costs(pair[0], 1).monthly)}</td>
                      <td>{zar(costs(pair[1], 1).monthly)}</td>
                      <td>{zar(costs(pair[1], 1).monthly - costs(pair[0], 1).monthly)}</td>
                    </tr>
                    {[1, 3, 5].flatMap((n) => {
                      const a = costs(pair[0]!, n),
                        b = costs(pair[1]!, n);
                      return [
                        ["Cash outflow", "cash"],
                        ["Resale estimate", "resale"],
                        ["Remaining debt", "balance"],
                        ["Net ownership cost", "economic"],
                      ].map(([label, key]) => (
                        <tr key={`${n}-${key}`}>
                          <th>
                            {n}-year {label.toLowerCase()}
                          </th>
                          <td>{zar(a[key as "cash"])}</td>
                          <td>{zar(b[key as "cash"])}</td>
                          <td>{zar(b[key as "cash"] - a[key as "cash"])}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              Net ownership cost = cash outflow + outstanding finance − resale. A negative
              difference means vehicle 2 costs less for that metric.{" "}
              <Link href="/sources" className="text-blue-300 underline">
                Methodology
              </Link>
            </p>
          </>
        )
      )}
    </>
  );
}
