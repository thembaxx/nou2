"use client";
import { PhotoCredit } from "./photo-credit";
import { Component, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { zar } from "@/lib/finance";
import { SaveButton } from "./vehicle-card";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { useGarage } from "./providers";
const Vehicle3D = dynamic(() => import("./vehicle-3d"), {
  ssr: false,
  loading: () => <p className="p-8">Loading schematic…</p>,
});
class SceneBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="notice">
        3D is unavailable on this device. All vehicle information is available above.
      </p>
    ) : (
      this.props.children
    );
  }
}
export function VehicleDetail({ vehicle: v }: { vehicle: Vehicle }) {
  const [photo, setPhoto] = useState(0);
  const [scene, setScene] = useState(false);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const { user, error } = useGarage();
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
        <div>
          <img
            className="aspect-[16/10] w-full object-cover"
            src={v.images[photo]}
            alt={
              v.example
                ? `Editorial photograph for ${v.name} example`
                : `${v.name}, photo ${photo + 1}`
            }
            width={1200}
            height={750}
            fetchPriority="high"
          />
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {v.images.map((url, i) => (
              <button
                key={i}
                onClick={() => setPhoto(i)}
                aria-label={`View photo ${i + 1}`}
                aria-pressed={photo === i}
                className={`shrink-0 border-2 ${photo === i ? "border-blue-400" : "border-transparent"}`}
              >
                <img width={100} height={70} src={url} alt="" className="h-16 w-24 object-cover" />
              </button>
            ))}
          </div>
          <PhotoCredit id={v.id} />
          {v.example && (
            <p className="mt-4 text-xs text-slate-400">
              Editorial photography. Model, trim and condition are not verified.
            </p>
          )}
        </div>
        <div className="panel p-7">
          <p className="eyebrow mb-5">
            {v.example
              ? "Illustrative vehicle"
              : v.sellerType === "DEALER"
                ? "Dealership listing"
                : "Private listing"}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{v.name}</h1>
          <p className="mt-6 text-4xl font-bold">{zar(v.price)}</p>
          <p className="mt-3 text-sm text-slate-400">
            {v.year} · {v.km.toLocaleString("en-ZA")} km · {v.location}
          </p>
          <dl className="mt-7 grid grid-cols-2 gap-5 border-t border-white/15 pt-6">
            {[
              ["Fuel", v.fuelType],
              ["Transmission", v.transmission],
              ["Body style", v.bodyType],
              ["Consumption", `${v.fuel} ${v.fuelType === "Electric" ? "kWh" : "L"}/100 km`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-7 text-sm font-semibold">{v.sellerName}</p>
          <p className="mt-2 text-xs text-slate-400">
            {v.example
              ? "Example seller · no contact available"
              : "Seller identity and vehicle condition have not been verified by Carpur."}
          </p>
          <div className="mt-7 flex items-center gap-3">
            <SaveButton id={v.id} className="border border-white/30" />
            <span className="text-sm">Save to your garage</span>
          </div>
          {error && (
            <p className="notice mt-3" role="alert">
              {error}
            </p>
          )}
          {v.example ? (
            <p className="notice mt-6">
              This example is not for sale and cannot receive enquiries.
            </p>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-6 w-full">Enquire with seller</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle className="mb-3 text-2xl font-bold">
                  Enquire about {v.name}
                </DialogTitle>
                <DialogDescription className="mb-6 text-sm text-slate-400">
                  Your message, name and account email will appear in the seller’s Carpur inbox.
                  Email notifications are not enabled.
                </DialogDescription>
                {user ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setPending(true);
                      setStatus("");
                      try {
                        const response = await fetch(`/api/listings/${v.id}/enquiries`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ message, consent }),
                        });
                        const data = await response.json();
                        setStatus(
                          response.ok
                            ? "Your enquiry is now in the seller’s Carpur inbox."
                            : data.error,
                        );
                        if (response.ok) setMessage("");
                      } catch {
                        setStatus("Could not send your enquiry. Try again.");
                      } finally {
                        setPending(false);
                      }
                    }}
                  >
                    <label className="label">
                      Your message
                      <textarea
                        required
                        minLength={10}
                        maxLength={2000}
                        rows={5}
                        className="field"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </label>
                    <label className="mt-5 flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                      <input
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      I agree to share my name and account email with this seller so they can reply.
                    </label>
                    <Button type="submit" disabled={pending} className="mt-6">
                      {pending ? "Sending…" : "Send enquiry"}
                    </Button>
                    <p role="status" className="mt-4 text-sm text-blue-200">
                      {status}
                    </p>
                  </form>
                ) : (
                  <Button asChild>
                    <Link href="/sign-in">Sign in to enquire</Link>
                  </Button>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <section className="my-12 max-w-3xl">
        <h2 className="mb-4 text-2xl font-bold">The vehicle’s story</h2>
        <p className="whitespace-pre-wrap leading-relaxed text-slate-300">{v.description}</p>
        {!v.example && (
          <p className="notice mt-6">
            Inspect the vehicle and documents before paying. Arrange an independent roadworthy or
            mechanical inspection. Never pay to secure a viewing.{" "}
            <Link href="/privacy" className="underline">
              Safety guidance
            </Link>
          </p>
        )}
      </section>
      <details className="panel mb-12 p-6">
        <summary className="cursor-pointer font-semibold">Explore a 3D vehicle schematic</summary>
        <p className="my-4 text-sm text-slate-400">
          Optional interactive view. Load it when you want to explore; no automatic rotation.
        </p>
        {scene ? (
          <SceneBoundary>
            <Vehicle3D />
          </SceneBoundary>
        ) : (
          <Button variant="outline" onClick={() => setScene(true)}>
            Load 3D schematic
          </Button>
        )}
      </details>
    </>
  );
}
