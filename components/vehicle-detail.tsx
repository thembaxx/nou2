"use client";
import { VehicleGallery } from "./vehicle-gallery";
import { useState } from "react";
import { VehicleExplorer } from "./vehicle-explorer";
import { matchingRealModel } from "@/lib/real-models";
import { energyUnit } from "@/lib/vehicle-options";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { zar } from "@/lib/finance";
import { SaveButton } from "./vehicle-card";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { useGarage } from "./providers";
export function VehicleDetail({ vehicle: v }: { vehicle: Vehicle }) {
  const matchedModel = matchingRealModel(v);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const { user, error } = useGarage();
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
        <VehicleGallery vehicle={v} />
        <div className="panel p-5 sm:p-7">
          <p className="eyebrow mb-5">
            {v.reference
              ? "New Car / Manufacturer Reference"
              : v.example
                ? "Illustrative vehicle"
                : v.sellerType === "DEALER"
                  ? "Dealership listing"
                  : "Private listing"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{v.name}</h1>
          <p className="mt-6 text-xs text-slate-400">
            {v.reference ? "Manufacturer Reference Price" : "Asking Price"}
          </p>
          <p className="mt-1 text-4xl font-bold">{zar(v.price)}</p>
          <p className="mt-3 text-sm text-slate-400">
            {v.reference
              ? "New Model · Confirm Stock With Dealer"
              : `${v.condition === "NEW" ? "New" : "Used"} · ${v.year} · ${v.km.toLocaleString("en-ZA")} km`}{" "}
            · {v.location}
          </p>
          <dl className="mt-7 grid grid-cols-2 gap-5 border-t border-white/15 pt-6">
            {[
              ["Fuel", v.fuelType],
              ["Transmission", v.transmission],
              ["Body style", v.bodyType],
              [
                "Consumption",
                v.reference && !v.reference.consumptionAvailable
                  ? "Not Published"
                  : `${v.fuel} ${energyUnit(v.fuelType)}/100 km${v.reference ? " (lab)" : ""}`,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-7 text-sm font-semibold">{v.sellerName}</p>
          <p className="mt-2 text-xs text-slate-400">
            {v.reference
              ? "Manufacturer data observed 13 October 2026; availability and current quote require dealer confirmation."
              : v.example
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
          {v.reference ? (
            <div className="mt-6">
              <Button className="w-full" asChild>
                <a href={v.reference.url} target="_blank" rel="noreferrer">
                  Request A Dealer Quote ↗
                </a>
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Continue to Toyota South Africa’s model page for buying options and its dealer
                network. Carpur does not submit an enquiry or reserve stock.
              </p>
              <a
                className="mt-3 inline-flex min-h-11 items-center text-xs text-blue-200 underline"
                href={v.reference.url}
                target="_blank"
                rel="noreferrer"
              >
                View Original Price & Specifications
              </a>
            </div>
          ) : v.example ? (
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
      {matchedModel ? (
        <details className="mb-12">
          <summary className="mb-4 cursor-pointer text-xl font-semibold">
            Explore This Model In 3D
          </summary>
          <VehicleExplorer initialModelId={matchedModel} />
        </details>
      ) : (
        <section className="notice mb-12">
          <h2 className="text-lg font-semibold">Photography Of This Model</h2>
          <p className="mt-2">
            A verified matching 3D asset is not available for this exact vehicle or trim. Use the
            photographs above and confirm condition and specifications with the seller or dealer.
          </p>
          <Link
            className="mt-3 inline-flex min-h-11 items-center text-blue-200 underline"
            href="/#real-car-studio"
          >
            Explore Real-Car 3D Models
          </Link>
        </section>
      )}
    </>
  );
}
