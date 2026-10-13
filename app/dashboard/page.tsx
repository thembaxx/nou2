import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { publicVehicle } from "@/lib/vehicles";
import { DashboardActions } from "@/components/dashboard-actions";
import { Button } from "@/components/ui/button";
import { zar } from "@/lib/finance";
export const metadata = { title: "Seller dashboard", robots: { index: false, follow: false } };
export default async function Page() {
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  const listings = await getDb().listing.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  const enquiries = await getDb().enquiry.findMany({
    where: { listing: { userId: session.user.id } },
    include: {
      listing: { select: { name: true } },
      buyer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="page">
      <p className="eyebrow mb-4">Seller dashboard</p>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="page-title">Your Next Chapter.</h1>
          <p className="mt-4 text-slate-400">
            Welcome, {session.user.name}. Manage your listings and buyer enquiries.
          </p>
        </div>
        <Button asChild>
          <Link href="/sell">Create listing</Link>
        </Button>
      </div>
      <div className="mb-10 grid grid-cols-3 gap-3">
        {[
          ["Listings", listings.length],
          ["Published", listings.filter((v) => v.status === "PUBLISHED").length],
          ["Enquiries", enquiries.length],
        ].map(([label, value]) => (
          <div className="panel p-5" key={label}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-2 text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>
      <h2 className="mb-5 text-2xl font-bold">Your listings</h2>
      {!listings.length && (
        <p className="panel p-8 text-slate-400">
          No listings yet. Add your first vehicle to get started.
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {listings.map((row) => (
          <article key={row.id} className="panel p-6">
            <div className="mb-6 flex gap-5">
              <img
                src={row.images[0]}
                alt={row.name}
                className="h-24 w-32 object-cover"
                width={160}
                height={100}
              />
              <div>
                <h3 className="text-xl font-bold">{row.name}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {zar(row.price)} · {row.status.toLowerCase()}
                </p>
                {row.status === "PUBLISHED" && (
                  <Link
                    href={`/vehicles/${row.id}`}
                    className="mt-2 inline-block text-xs text-blue-300"
                  >
                    View public listing
                  </Link>
                )}
              </div>
            </div>
            <DashboardActions vehicle={publicVehicle(row)} />
          </article>
        ))}
      </div>
      <section className="mt-14">
        <h2 className="mb-3 text-2xl font-bold">Seller inbox</h2>
        <p className="mb-6 text-sm text-slate-400">
          Enquiries appear here. Reply directly to the buyer’s email. Carpur does not send email
          notifications.
        </p>
        {!enquiries.length && <p className="panel p-8 text-slate-400">No enquiries yet.</p>}
        {enquiries.map((e) => (
          <article key={e.id} className="panel mb-4 p-6">
            <p className="mb-3 text-xs text-slate-400">
              {e.listing.name} · {e.createdAt.toLocaleDateString("en-ZA")}
            </p>
            <h3 className="text-lg font-semibold">{e.buyer.name}</h3>
            <p className="my-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {e.message}
            </p>
            <a
              className="text-sm text-blue-300 underline"
              href={`mailto:${encodeURIComponent(e.buyer.email)}?subject=${encodeURIComponent(`Carpur enquiry: ${e.listing.name}`)}`}
            >
              Reply to {e.buyer.email}
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
