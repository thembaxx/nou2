"use client";
import { useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { VehicleCard } from "./vehicle-card";
import { useGarage } from "./providers";
import { Button } from "./ui/button";
export function Marketplace({
  vehicles,
  available,
  illustrative,
}: {
  vehicles: Vehicle[];
  available: boolean;
  illustrative: boolean;
}) {
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [max, setMax] = useState("");
  const [type, setType] = useState("");
  const [body, setBody] = useState("");
  const [sort, setSort] = useState("newest");
  const { error } = useGarage();
  const visible = vehicles
    .filter(
      (v) =>
        `${v.name} ${v.location}`.toLowerCase().includes(query.toLowerCase()) &&
        (!make || v.make === make) &&
        (!max || v.price <= Number(max)) &&
        (!type || v.sellerType === type) &&
        (!body || v.bodyType === body),
    )
    .sort((a, b) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : sort === "mileage"
            ? a.km - b.km
            : 0,
    );
  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild variant={illustrative ? "outline" : "default"} size="sm">
          <Link href="/marketplace">Seller listings</Link>
        </Button>
        <Button asChild variant={illustrative ? "default" : "outline"} size="sm">
          <Link href="/marketplace?inventory=examples">Illustrative vehicles</Link>
        </Button>
      </div>
      {illustrative && (
        <p className="notice mb-8">
          These examples are not for sale. Prices and specifications are illustrative; photography
          may differ from the described model. Use them to explore forecasts.
        </p>
      )}
      {!available && !illustrative && (
        <p className="notice mb-8" role="status">
          The inventory service is temporarily unavailable. Please try again later, or explore
          illustrative vehicles.
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
            {["Sedan", "Hatchback", "SUV", "Bakkie", "Coupe", "Other"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Sort by
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest listings</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="mileage">Lowest mileage</option>
          </select>
        </label>
      </div>
      <p role="status" className="mb-5 text-sm text-slate-400">
        {visible.length} vehicle{visible.length === 1 ? "" : "s"}
        {illustrative ? " · illustrative inventory" : " · seller supplied listings"}
      </p>
      {error && (
        <p role="alert" className="notice mb-5">
          {error}
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {visible.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
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
