import { Marketplace } from "@/components/marketplace";
import { inventory } from "@/lib/vehicles";
import { examples } from "@/lib/examples";
import { catalogue } from "@/lib/catalogue";
export const metadata = { title: "Buy new & used cars in South Africa" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    inventory?: string;
    condition?: string;
    body?: string;
    fuel?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const mode =
    params.inventory === "examples"
      ? "examples"
      : params.inventory === "sellers" || params.condition === "USED"
        ? "sellers"
        : "catalogue";
  const data =
    mode === "sellers"
      ? await inventory()
      : { available: true, vehicles: mode === "examples" ? examples : catalogue };
  return (
    <div className="page">
      <p className="eyebrow mb-4">South Africa / New cars first. Your next drive.</p>
      <h1 className="page-title mb-5">Find Your Next Car.</h1>
      <p className="mb-10 max-w-2xl text-slate-400">
        Explore manufacturer models, compare realistic ownership costs, then confirm the price and
        availability with a dealer. Browse second hand cars from sellers.
      </p>
      <Marketplace
        key={`${mode}-${params.condition}-${params.body}-${params.fuel}`}
        vehicles={data.vehicles}
        available={data.available}
        mode={mode}
        initial={{
          condition: params.condition || "",
          body: params.body || "",
          fuel: params.fuel || "",
          query: params.q || "",
        }}
      />
    </div>
  );
}
