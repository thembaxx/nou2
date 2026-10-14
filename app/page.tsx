import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleExplorer } from "@/components/vehicle-explorer";
import { ObjectIllustration } from "@/components/object-illustration";
import { featuredNewCars, catalogue } from "@/lib/catalogue";
import { inventory } from "@/lib/vehicles";
export default async function Home() {
  const data = await inventory();
  const used = data.vehicles.filter((v) => v.condition === "USED").slice(0, 4);
  const fresh = data.vehicles.filter((v) => v.condition === "NEW").slice(0, 4);
  return (
    <>
      <section className="shopping-hero section">
        <div className="shopping-hero-inner mx-auto max-w-[1600px]">
          <Reveal className="shopping-hero-copy">
            <p className="eyebrow mb-5 text-blue-200">Made For Your Next Move / South Africa</p>
            <h1 className="hero-title mb-6">
              Find Your
              <br />
              Next Car<span className="text-blue-400">.</span>
            </h1>
            <p className="mb-7 max-w-lg text-base leading-relaxed text-slate-300 md:text-lg">
              New possibilities. Second hand discoveries. Find a car you love, with a clear view of
              what it will cost to own.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/marketplace">
                  Shop New Cars
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/marketplace?inventory=sellers&condition=USED">
                  Shop Second Hand
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
            <form action="/marketplace" className="hero-search mt-6">
              <label className="label" htmlFor="home-search">
                What Are You Looking For?
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="home-search"
                  className="field"
                  name="q"
                  placeholder="Search make or model"
                />
                <Button type="submit" size="icon" aria-label="Search cars">
                  <ArrowRight />
                </Button>
              </div>
            </form>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-300" />
              Manufacturer reference prices, seller asking prices and cost estimates are clearly
              distinguished.
            </p>
          </Reveal>
          <div id="real-car-studio" className="shopping-hero-studio">
            <VehicleExplorer />
          </div>
        </div>
      </section>
      <section className="section mx-auto max-w-[1760px]" id="new-cars">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-3">01 / A Fresh Start</p>
            <h2 className="page-title">Discover New Cars.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              {catalogue.length} manufacturer-published Toyota variants across 10 ranges. Reference
              prices observed 13 October 2026; confirm today’s quote and delivery with a dealer.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/marketplace">
              View New Car Catalogue
              <ArrowUpRight />
            </Link>
          </Button>
        </Reveal>
        <Reveal className="vehicle-grid">
          {featuredNewCars.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </Reveal>
        {fresh.length > 0 && (
          <>
            <h3 className="mb-5 mt-10 text-2xl font-bold">New Cars From Sellers</h3>
            <Reveal className="vehicle-grid">
              {fresh.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </Reveal>
          </>
        )}
      </section>
      <section className="section border-y border-white/10 bg-[#11161e]" id="used-cars">
        <div className="mx-auto max-w-[1600px]">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow mb-3">02 / A New Chapter</p>
              <h2 className="page-title">Second Hand. First Choice.</h2>
              <p className="mt-4 max-w-2xl text-sm text-slate-400">
                Compare mileage, condition and service history. Budget for an inspection and a
                repair reserve before you commit.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/marketplace?inventory=sellers&condition=USED">
                Browse Second Hand
                <ArrowUpRight />
              </Link>
            </Button>
          </Reveal>
          {used.length ? (
            <Reveal className="vehicle-grid">
              {used.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </Reveal>
          ) : (
            <div className="panel grid gap-6 p-6 md:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-xl font-semibold">Seller Inventory Is Coming</h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                  {data.available
                    ? "There are no published second hand cars yet."
                    : "Seller inventory is currently unavailable."}{" "}
                  Explore the verified new-car catalogue while dealerships and private sellers add
                  stock.
                </p>
              </div>
              <Button asChild className="self-center">
                <Link href="/sell">
                  List A Car
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      <section className="section mx-auto max-w-[1760px]">
        <Reveal className="mb-9">
          <p className="eyebrow mb-3">03 / What Moves You?</p>
          <h2 className="page-title">Explore The Technology.</h2>
          <p className="mt-4 max-w-xl text-slate-400">
            Choose a powertrain that fits your driving, charging access and budget. These animated
            diagrams explain the technology; the 3D studio above shows identifiable real cars.
          </p>
        </Reveal>
        <div className="technology-grid">
          {[
            [
              "engine",
              "Petrol & Diesel",
              "Petrol",
              "Familiar refuelling. Include regular servicing and fuel-price changes.",
            ],
            [
              "hybrid",
              "Hybrid",
              "Hybrid",
              "Engine and motor together. Best-case economy depends on your route.",
            ],
            [
              "battery",
              "Electric",
              "Electric",
              "Plan charging, range and battery cover alongside the purchase price.",
            ],
            [
              "hybrid",
              "Plug-in Hybrid",
              "Plug-in Hybrid",
              "Budget for petrol and charging; regular charging affects the economics.",
            ],
          ].map(([kind, title, fuel, copy]) => (
            <Reveal className="panel technology-card" key={title}>
              <ObjectIllustration kind={kind as "engine" | "battery" | "hybrid"} />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{copy}</p>
              <Link
                href={`/marketplace?fuel=${encodeURIComponent(fuel)}`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-blue-200"
              >
                Explore Cars
                <ArrowUpRight size={16} />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section light">
        <Reveal className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4 !text-slate-600">04 / Buy With A Clear View</p>
            <h2 className="page-title">
              A Car You Love.
              <br />A Budget That Works.
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-slate-600">
              The instalment is only the start. See finance, fuel or electricity, insurance and
              maintenance — then compare 1-, 3- and 5-year ownership.
            </p>
            <Button className="mt-7" asChild variant="secondary">
              <Link href="/affordability">
                Check My Budget
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="squircle-panel !bg-white p-6 sm:p-8">
            <h3 className="text-2xl font-bold">Before You Buy</h3>
            <ul className="mt-6 space-y-5 text-sm leading-relaxed text-slate-600">
              {[
                "Get a written price including on-road fees and optional extras.",
                "Confirm stock, delivery date, warranty and service-plan cover.",
                "Compare lender terms, fees and any balloon settlement.",
                "Request an insurance quote and keep room for unexpected repairs.",
                "For used cars, check ownership, service history and independent inspection.",
              ].map((text) => (
                <li key={text} className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-blue-700" />
                  {text}
                </li>
              ))}
            </ul>
            <Link
              href="/compare"
              className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700"
            >
              Compare Two Cars
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
      <section className="section">
        <Reveal className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-8">
          <div>
            <p className="eyebrow mb-4">For Dealerships & Private Sellers</p>
            <h2 className="page-title">Find Your Next Buyer.</h2>
            <p className="mt-4 text-slate-400">
              List any make, new or used. Add real photographs, clear details and your asking price.
            </p>
          </div>
          <Button asChild>
            <Link href="/sell">
              Sell On Carpur
              <ArrowUpRight />
            </Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
