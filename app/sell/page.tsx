import Link from "next/link";
import { notFound } from "next/navigation";
import { currentSession, authConfigured } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { publicVehicle } from "@/lib/vehicles";
import { ListingForm } from "@/components/listing-form";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Sell your vehicle", robots: { index: false, follow: true } };
export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await currentSession();
  const id = (await searchParams).id;
  const listing =
    session && id
      ? await getDb().listing.findFirst({ where: { id, userId: session.user.id } })
      : null;
  if (session && id && !listing) notFound();
  return (
    <div className="page !max-w-5xl">
      <p className="eyebrow mb-4">Private sellers & dealerships</p>
      <h1 className="page-title mb-5">{listing ? "TELL YOUR STORY." : "YOUR NEXT CHAPTER."}</h1>
      <p className="mb-10 text-slate-400">
        Create a clear, honest listing. Add your photographs and connect with buyers.
      </p>
      {session ? (
        <ListingForm initial={listing ? publicVehicle(listing) : undefined} />
      ) : (
        <div className="panel p-8">
          <h2 className="mb-4 text-2xl font-bold">Sign in to list your vehicle.</h2>
          <p className="mb-6 text-slate-400">
            Listings and enquiries belong to your account. Private sellers and dealerships use the
            same secure dashboard.
          </p>
          {authConfigured() ? (
            <Button asChild>
              <Link href="/sign-in">Sign in or create account</Link>
            </Button>
          ) : (
            <p className="notice">
              Publishing is temporarily unavailable while account services are configured.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
