import type { Metadata } from "next";
import { inventory } from "@/lib/vehicles";
import { examples } from "@/lib/examples";
import { Marketplace } from "@/components/marketplace";
export const metadata: Metadata = {
  title: "Discover vehicles",
  description: "Search South African seller listings by make, price, city and seller type.",
};
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ inventory?: string }>;
}) {
  const illustrative = (await searchParams).inventory === "examples";
  const data = illustrative ? { vehicles: examples, available: true } : await inventory();
  return (
    <div className="page">
      <p className="eyebrow mb-4">Discover / South Africa</p>
      <h1 className="page-title mb-5">FIND YOUR NEXT DRIVE.</h1>
      <p className="mb-10 text-slate-400">
        A place for private sellers, dealerships and smarter decisions.
      </p>
      <Marketplace {...data} illustrative={illustrative} />
    </div>
  );
}
