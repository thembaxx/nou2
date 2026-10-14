"use client";
import { useState } from "react";
import Link from "next/link";
import { BODY_TYPES, FUEL_TYPES } from "@/lib/vehicle-options";
import type { Vehicle } from "@/lib/types";
import { VehicleCard } from "./vehicle-card";
import { Reveal } from "./reveal";
import { useGarage } from "./providers";
import { Button } from "./ui/button";
export function Marketplace({
  vehicles,
  available,
  mode,
  initial,
}: {
  vehicles: Vehicle[];
  available: boolean;
  mode: "catalogue" | "sellers" | "examples";
  initial: { condition: string; body: string; fuel: string; query: string };
}) {
  const illustrative = mode === "examples";
  const reference = mode === "catalogue";
  const [condition, setCondition] = useState(initial.condition);
  const [fuel, setFuel] = useState(initial.fuel);
  const [query, setQuery] = useState(initial.query);
  const [make, setMake] = useState("");
  const [max, setMax] = useState("");
  const [type, setType] = useState("");
  const [body, setBody] = useState(initial.body);
  const [sort, setSort] = useState("new-first");
  const { error } = useGarage();
  const visible = vehicles
    .filter(
      (v) =>
        `${v.name} ${v.location}`.toLowerCase().includes(query.toLowerCase()) &&
        (!make || v.make === make) &&
        (!max || v.price <= Number(max)) &&
        (!type || v.sellerType === type) &&
        (!body || v.bodyType === body) &&
        (!condition || v.condition === condition) &&
        (!fuel || v.fuelType === fuel),
    )
    .sort((a, b) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : sort === "mileage"
            ? a.km - b.km
            : sort === "new-first"
              ? a.condition === b.condition
                ? 0
                : a.condition === "NEW"
                  ? -1
                  : 1
              : 0,
    );
  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3" aria-label="Inventory source">
        <Button asChild variant={reference ? "default" : "outline"} size="sm">
          <Link href="/marketplace">New Car Catalogue</Link>
        </Button>
        <Button asChild variant={mode === "sellers" ? "default" : "outline"} size="sm">
          <Link href="/marketplace?inventory=sellers">Seller Listings</Link>
        </Button>
        <Button asChild variant={illustrative ? "default" : "outline"} size="sm">
          <Link href="/marketplace?inventory=examples">Illustrative Vehicles</Link>
        </Button>
      </div>
      {reference && (
        <p className="notice mb-8">
          Manufacturer reference prices observed 13 October 2026. These models are not verified
          dealer stock or Carpur offers. Confirm the current price, on-road fees, options and
          delivery time with the manufacturer’s dealer network. Current catalogue coverage: Toyota;
          seller listings support any make.
        </p>
      )}
      {!reference && (
        <div className="mb-6 flex flex-wrap gap-3" aria-label="Vehicle condition">
          {[
            ["", "New First"],
            ["NEW", "New Cars"],
            ["USED", "Second Hand"],
          ].map(([value, label]) => (
            <Button
              key={value}
              variant={condition === value ? "default" : "outline"}
              size="sm"
              aria-pressed={condition === value}
              onClick={() => setCondition(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
      {illustrative && (
        <p className="notice mb-8">
          These examples are not for sale. Prices and specifications are illustrative; photography
          may differ from the described model. Use them to explore forecasts.
        </p>
      )}
      {!available && mode === "sellers" && (
        <p className="notice mb-8" role="status">
          The inventory service is temporarily unavailable. Please try again later, or browse the
          manufacturer catalogue.
        </p>
      )}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="label">
          Search
          <input
            className="field"
            placeholder="Make, model or city"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="label">
          Make
          <select className="field" value={make} onChange={(e) => setMake(e.target.value)}>
            <option value="">All makes</option>
            {[...new Set(vehicles.map((v) => v.make))].sort().map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Maximum price
          <select className="field" value={max} onChange={(e) => setMax(e.target.value)}>
            <option value="">Any price</option>
            {[200000, 400000, 600000, 1000000].map((v) => (
              <option key={v} value={v}>
                R{v.toLocaleString("en-ZA")}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Seller type
          <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All sellers</option>
            <option value="PRIVATE">Private seller</option>
            <option value="DEALER">Dealership</option>
          </select>
        </label>
        <label className="label">
          Body type
          <select className="field" value={body} onChange={(e) => setBody(e.target.value)}>
            <option value="">All body types</option>
            {BODY_TYPES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Powertrain
          <select className="field" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="">All powertrains</option>
            {FUEL_TYPES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Sort by
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new-first">New cars first</option>
            <option value="newest">Recently listed</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="mileage">Lowest mileage</option>
          </select>
        </label>
      </div>
      <p role="status" className="mb-5 text-sm text-slate-400">
        {visible.length} vehicle{visible.length === 1 ? "" : "s"}
        {illustrative
          ? " · illustrative inventory"
          : reference
            ? " · manufacturer catalogue models"
            : " · seller supplied listings"}
      </p>
      {error && (
        <p role="alert" className="notice mb-5">
          {error}
        </p>
      )}
      <Reveal className="vehicle-grid">
        {visible.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </Reveal>
      {visible.length === 0 && (
        <div className="panel p-10 text-center">
          <h2 className="mb-3 text-2xl font-semibold">
            {vehicles.length ? "No matches yet." : "Your next drive starts here."}
          </h2>
          <p className="mb-6 text-slate-400">
            {vehicles.length
              ? "Try another search or clear your filters."
              : "There are no published seller listings yet. Explore the cost tools with illustrative vehicles or create a listing."}
          </p>
          {vehicles.length ? (
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setMake("");
                setMax("");
                setType("");
                setBody("");
                setCondition("");
                setFuel("");
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button asChild>
              <Link href="/sell">Create a listing</Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
