import { notFound } from "next/navigation";
import { vehicleById, siteUrl } from "@/lib/vehicles";
import { VehicleDetail } from "@/components/vehicle-detail";
import { FinanceTool } from "@/components/finance-tool";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const v = await vehicleById((await params).id);
  return v
    ? {
        title: `${v.name}${v.example ? " — illustrative" : ""}`,
        description: `${v.year} ${v.name} in ${v.location}. Explore specifications and estimated ownership costs.`,
        robots: v.example ? { index: false, follow: true } : undefined,
        alternates: { canonical: `/vehicles/${v.id}` },
      }
    : { title: "Vehicle unavailable" };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const v = await vehicleById((await params).id);
  if (!v) notFound();
  const structured = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: v.name,
    vehicleModelDate: String(v.year),
    fuelType: v.fuelType,
    url: `${siteUrl()}/vehicles/${v.id}`,
    description: v.description,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.km, unitCode: "KMT" },
  };
  return (
    <div className="page">
      <VehicleDetail vehicle={v} />
      <h2 className="page-title mb-8">KNOW THE COST.</h2>
      <FinanceTool vehicles={[v]} initialId={v.id} />
      {!v.example && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }}
        />
      )}
    </div>
  );
}
