import { FinanceTool } from "@/components/finance-tool";
import { inventory } from "@/lib/vehicles";
import { examples } from "@/lib/examples";
import { catalogue } from "@/lib/catalogue";
export const metadata = { title: "Affordability & ownership costs" };
export default async function Page() {
  const data = await inventory();
  return (
    <div className="page">
      <p className="eyebrow mb-4">Financial intelligence</p>
      <h1 className="page-title mb-5">
        The Real Cost.
        <br />
        No Guesswork.
      </h1>
      <p className="mb-10 max-w-2xl text-slate-400">
        Adjust every assumption. Understand finance, running costs and the longer view. Your
        financial inputs stay in your browser and are not sent to Carpur.
      </p>
      <FinanceTool vehicles={[...data.vehicles, ...catalogue, ...examples]} />
    </div>
  );
}
