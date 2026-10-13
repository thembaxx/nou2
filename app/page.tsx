import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calculator, Gauge, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { VehicleCard } from "@/components/vehicle-card";
import { examples } from "@/lib/examples";
export default function Home() {
  return (
    <>
      <section className="hero relative flex items-end">
        <div className="mx-auto w-full max-w-[1600px] px-6 pb-20 pt-20 md:px-16 md:pb-24">
          <Reveal className="max-w-3xl">
            <p className="eyebrow mb-6">South Africa’s smarter automotive marketplace</p>
            <h1 className="mb-7 text-[clamp(52px,8.3vw,124px)] font-black leading-[.89] tracking-[-.075em]">
              BEYOND
              <br />
              THE PRICE
              <br />
              TAG<span className="text-[#3679ff]">.</span>
            </h1>
            <p className="mb-9 max-w-lg text-base leading-relaxed text-white/85 md:text-xl">
              Find your next car. Know what it will really cost. Buy with confidence, not surprises.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/marketplace">
                  Explore vehicles <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/affordability">
                  Calculate my budget <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
        <span className="absolute bottom-5 right-6 text-[10px] uppercase tracking-widest text-white/70">
          Discover · Decide · Drive
        </span>
      </section>
      <div className="flex flex-wrap justify-center gap-7 border-b border-white/10 bg-[#15181c] px-6 py-6 text-[11px] uppercase tracking-widest text-slate-300 md:gap-20">
        <span>
          <ShieldCheck className="mr-2 inline size-4 text-blue-400" />
          Dealer + private listings
        </span>
        <span>
          <Calculator className="mr-2 inline size-4 text-blue-400" />
          Transparent ownership estimates
        </span>
        <span>
          <Gauge className="mr-2 inline size-4 text-blue-400" />
          Built for South Africa
        </span>
      </div>
      <section className="section mx-auto max-w-[1600px]">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">01 / Discover the possibilities</p>
            <h2 className="page-title">FIND YOUR NEXT DRIVE.</h2>
            <p className="mt-4 text-slate-400">
              Explore the experience with illustrative vehicles. No live offers shown below.
            </p>
          </div>
          <Link href="/marketplace" className="flex items-center gap-2 text-sm">
            Browse seller listings <ArrowUpRight size={16} />
          </Link>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {examples.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>
      <section className="section light">
        <Reveal className="mx-auto grid max-w-[1500px] items-end gap-10 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="eyebrow mb-4 !text-slate-600">02 / Ownership intelligence</p>
            <h2 className="page-title">
              THE REAL COST.
              <br />
              NO GUESSWORK.
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-slate-600">
              A price tag tells one part of the story. Explore repayments, fuel, insurance,
              maintenance and depreciation over 1, 3 and 5 years.
            </p>
          </div>
          <div>
            <p className="mb-6 leading-relaxed text-slate-600">
              Every assumption is visible and editable. Your budget stays in your browser. No credit
              score, approval prediction or hidden finance offer.
            </p>
            <Button asChild variant="secondary">
              <Link href="/affordability">
                Understand your budget <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
      <section className="section mx-auto max-w-[1600px]">
        <Reveal>
          <p className="eyebrow mb-4">03 / A clearer decision</p>
          <h2 className="page-title mb-12">CONFIDENCE AT EVERY TURN.</h2>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            [
              "01",
              "DISCOVER",
              "Find vehicles from private sellers and dealerships.",
              "/marketplace",
            ],
            [
              "02",
              "UNDERSTAND",
              "Compare two cars by their long-term cost, not just their asking price.",
              "/compare",
            ],
            [
              "03",
              "CONNECT",
              "Save your shortlist and send an enquiry to a seller’s Carpur inbox.",
              "/garage",
            ],
          ].map(([n, title, copy, href]) => (
            <Reveal key={n} className="border-t border-white/30 pt-6">
              <p className="mb-10 text-xs font-bold text-blue-400">{n}</p>
              <h3 className="mb-3 text-2xl font-black">{title}</h3>
              <p className="mb-6 leading-relaxed text-slate-400">{copy}</p>
              <Link href={href} className="text-sm text-blue-300">
                Explore <ArrowUpRight className="inline size-4" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section border-t border-white/10 bg-[#12161d]">
        <Reveal className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-8">
          <div>
            <p className="eyebrow mb-4">Private sellers & dealerships</p>
            <h2 className="page-title">READY TO SELL?</h2>
            <p className="mt-4 text-slate-400">
              Your vehicle. Your story. A smarter place to connect.
            </p>
          </div>
          <Button asChild>
            <Link href="/sell">
              Create a listing <ArrowUpRight />
            </Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
