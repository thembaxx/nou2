import { CompareTool } from "@/components/compare-tool";
import { inventory } from "@/lib/vehicles";
import { examples } from "@/lib/examples";
export const metadata = { title: "Compare two vehicles" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const data = await inventory();
  const params = await searchParams;
  return (
    <div className="page">
      <p className="eyebrow mb-4">Compare / 1 · 3 · 5 years</p>
      <h1 className="page-title mb-5">
        TWO CARS.
        <br />
        ONE DECISION.
      </h1>
      <p className="mb-10 text-slate-400">
        See what each vehicle could cost across the years. Illustrative vehicles are labelled.
      </p>
      <CompareTool
        vehicles={[...data.vehicles, ...examples]}
        initialIds={[params.a || "", params.b || ""]}
      />
    </div>
  );
}
