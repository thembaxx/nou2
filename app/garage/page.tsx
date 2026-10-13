import { Garage } from "@/components/garage";
import { examples } from "@/lib/examples";
import { catalogue } from "@/lib/catalogue";
import { inventory, publicVehicle } from "@/lib/vehicles";
import { currentSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const metadata = { title: "Your buyer garage", robots: { index: false, follow: true } };
export default async function Page() {
  const data = await inventory();
  const session = await currentSession();
  const saved = session
    ? await getDb().savedVehicle.findMany({
        where: { userId: session.user.id },
        include: { listing: true },
      })
    : [];
  const vehicles = [
    ...new Map(
      [
        ...data.vehicles,
        ...saved.map((v) => publicVehicle(v.listing)),
        ...catalogue,
        ...examples,
      ].map((v) => [v.id, v]),
    ).values(),
  ];
  return (
    <div className="page">
      <p className="eyebrow mb-4">Buyer garage</p>
      <h1 className="page-title mb-8">
        Your Next Drive.
        <br />
        On Your Terms.
      </h1>
      <Garage vehicles={vehicles} />
    </div>
  );
}
