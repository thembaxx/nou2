"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BODY_TYPES, FUEL_TYPES, MAKES } from "@/lib/vehicle-options";
import type { Vehicle } from "@/lib/types";
import type { InventoryPage } from "@/lib/vehicles";
import { VehicleCard } from "./vehicle-card";
import { Reveal } from "./reveal";
import { useGarage } from "./providers";
import { Button } from "./ui/button";
function validInventoryPage(value: unknown): value is InventoryPage {
  if (!value || typeof value !== "object") return false;
  const page = value as Record<string, unknown>;
  return (
    page.available === true &&
    Array.isArray(page.vehicles) &&
    page.vehicles.length <= 24 &&
    page.vehicles.every((vehicle: unknown) => {
      if (!vehicle || typeof vehicle !== "object") return false;
      const v = vehicle as Record<string, unknown>;
      return (
        [
          "id",
          "name",
          "make",
          "location",
          "fuelType",
          "transmission",
          "bodyType",
          "sellerName",
          "description",
          "status",
        ].every((key) => typeof v[key] === "string") &&
        ["price", "year", "km", "fuel"].every(
          (key) => typeof v[key] === "number" && Number.isFinite(v[key]),
        ) &&
        (v.condition === "NEW" || v.condition === "USED") &&
        (v.sellerType === "PRIVATE" || v.sellerType === "DEALER") &&
        v.example === false &&
        Array.isArray(v.images) &&
        v.images.every((url: unknown) => typeof url === "string")
      );
    }) &&
    ["total", "page", "pageSize", "totalPages"].every(
      (key) => Number.isSafeInteger(page[key]) && Number(page[key]) >= (key === "total" ? 0 : 1),
    ) &&
    page.pageSize === 24 &&
    Number(page.page) <= Number(page.totalPages) &&
    typeof page.hasPrevious === "boolean" &&
    typeof page.hasNext === "boolean" &&
    Array.isArray(page.makes) &&
    page.makes.every((make: unknown) => typeof make === "string")
  );
}

export function Marketplace({
  vehicles,
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
  const sellerInventory = mode === "sellers";
  const [condition, setCondition] = useState(initial.condition);
  const [fuel, setFuel] = useState(initial.fuel);
  const [query, setQuery] = useState(initial.query);
  const [make, setMake] = useState("");
  const [max, setMax] = useState("");
  const [type, setType] = useState("");
  const [body, setBody] = useState(initial.body);
  const [sort, setSort] = useState("new-first");
  const [page, setPage] = useState(1);
  const [sellerPage, setSellerPage] = useState<InventoryPage | null>(null);
  const [loading, setLoading] = useState(sellerInventory);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const { error } = useGarage();
  useEffect(() => {
    if (!sellerInventory) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({
        query,
        make,
        condition,
        body,
        fuel,
        sellerType: type,
        maxPrice: max,
        sort,
        page: String(page),
      });
      try {
        const response = await fetch(`/api/inventory?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok)
          throw new Error(
            "Seller listings could not be loaded. Try again or browse the manufacturer catalogue.",
          );
        const result: unknown = await response.json();
        if (!validInventoryPage(result))
          throw new Error("The inventory response could not be verified. Please try again.");
        if (controller.signal.aborted) return;
        setSellerPage(result);
        if (result.page !== page) setPage(result.page);
      } catch (cause) {
        if (!controller.signal.aborted)
          setLoadError(
            cause instanceof Error ? cause.message : "Seller listings could not be loaded.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [sellerInventory, query, make, condition, body, fuel, type, max, sort, page, retry]);
  const visible = sellerInventory
    ? loading || loadError
      ? []
      : (sellerPage?.vehicles ?? [])
    : vehicles
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
              onClick={() => {
                setCondition(value);
                setPage(1);
              }}
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
      {sellerInventory && loadError && (
        <div className="notice mb-8" role="alert">
          <p>{loadError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try seller listings again
          </Button>
        </div>
      )}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="label">
          Search
          <input
            className="field"
            placeholder="Make, model or city"
            value={query}
            maxLength={120}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="label">
          Make
          <select
            className="field"
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All makes</option>
            {[
              ...new Set(
                sellerInventory
                  ? [...MAKES, ...(sellerPage?.makes ?? []), ...(make ? [make] : [])]
                  : vehicles.map((v) => v.make),
              ),
            ]
              .sort()
              .map((v) => (
                <option key={v}>{v}</option>
              ))}
          </select>
        </label>
        <label className="label">
          Maximum price
          <select
            className="field"
            value={max}
            onChange={(e) => {
              setMax(e.target.value);
              setPage(1);
            }}
          >
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
          <select
            className="field"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All sellers</option>
            <option value="PRIVATE">Private seller</option>
            <option value="DEALER">Dealership</option>
          </select>
        </label>
        <label className="label">
          Body type
          <select
            className="field"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All body types</option>
            {BODY_TYPES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Powertrain
          <select
            className="field"
            value={fuel}
            onChange={(e) => {
              setFuel(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All powertrains</option>
            {FUEL_TYPES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="label">
          Sort by
          <select
            className="field"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="new-first">New cars first</option>
            <option value="newest">Recently listed</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="mileage">Lowest mileage</option>
          </select>
        </label>
      </div>
      <p role="status" className="mb-5 text-sm text-slate-400">
        {sellerInventory
          ? loading
            ? "Loading matching seller listings…"
            : loadError
              ? "Seller inventory is unavailable."
              : `${sellerPage?.total ?? 0} matching vehicle${sellerPage?.total === 1 ? "" : "s"}`
          : `${visible.length} vehicle${visible.length === 1 ? "" : "s"}`}
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
      <div aria-busy={sellerInventory && loading}>
        <Reveal className="vehicle-grid">
          {visible.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </Reveal>
      </div>
      {sellerInventory && sellerPage && !loading && !loadError && sellerPage.total > 0 && (
        <nav
          className="my-8 flex flex-wrap items-center justify-between gap-4"
          aria-label="Seller listing pages"
        >
          <p className="text-sm text-slate-400">
            Showing {(sellerPage.page - 1) * sellerPage.pageSize + 1}–
            {(sellerPage.page - 1) * sellerPage.pageSize + visible.length} of {sellerPage.total} ·
            Page {sellerPage.page} of {sellerPage.totalPages}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={!sellerPage.hasPrevious}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous page
            </Button>
            <Button
              variant="outline"
              disabled={!sellerPage.hasNext}
              onClick={() => setPage((value) => value + 1)}
            >
              Next page
            </Button>
          </div>
        </nav>
      )}
      {visible.length === 0 && !(sellerInventory && (loading || loadError)) && (
        <div className="panel p-10 text-center">
          <h2 className="mb-3 text-2xl font-semibold">
            {(sellerInventory && (query || make || max || type || body || condition || fuel)) ||
            (!sellerInventory && vehicles.length)
              ? "No matches yet."
              : "Your next drive starts here."}
          </h2>
          <p className="mb-6 text-slate-400">
            {(
              sellerInventory
                ? query || make || max || type || body || condition || fuel
                : vehicles.length
            )
              ? "Try another search or clear your filters."
              : "There are no published seller listings yet. Explore the cost tools with illustrative vehicles or create a listing."}
          </p>
          {(
            sellerInventory
              ? query || make || max || type || body || condition || fuel
              : vehicles.length
          ) ? (
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
                setPage(1);
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
