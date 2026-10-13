"use client";
import type { Vehicle } from "@/lib/types";
import { useGarage } from "./providers";
import { VehicleCard } from "./vehicle-card";
import { Button } from "./ui/button";
import Link from "next/link";
export function Garage({ vehicles }: { vehicles: Vehicle[] }) {
  const { user, ids, error, toggle } = useGarage();
  const saved = vehicles.filter((v) => ids.includes(v.id));
  const missing = ids.filter((id) => !vehicles.some((v) => v.id === id));
  return (
    <>
      <p className="notice mb-8">
        {user
          ? "Live vehicles are saved to your account. Catalogue models and illustrative vehicles stay in this browser."
          : "Your garage is saved in this browser. Sign in to save live vehicles across devices."}
      </p>
      {error && (
        <p className="notice mb-5" role="alert">
          {error}
        </p>
      )}
      {saved.length >= 2 && (
        <Button asChild className="mb-8">
          <Link href={`/compare?a=${saved[0].id}&b=${saved[1].id}`}>
            Compare first two saved vehicles
          </Link>
        </Button>
      )}
      <div className="vehicle-grid">
        {saved
          .filter((v) => v.status === "PUBLISHED" || v.example || v.reference)
          .map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
      </div>
      {saved
        .filter((v) => v.status !== "PUBLISHED" && !v.example && !v.reference)
        .map((v) => (
          <div key={v.id} className="panel mt-5 p-5">
            <p>{v.name} · no longer available</p>
            <button className="mt-3 text-sm text-blue-300" onClick={() => toggle(v.id)}>
              Remove from garage
            </button>
          </div>
        ))}
      {missing.map((id) => (
        <div key={id} className="panel mt-5 p-5">
          <p className="text-sm text-slate-400">A saved vehicle is no longer available.</p>
          <button className="mt-3 text-sm text-blue-300" onClick={() => toggle(id)}>
            Remove unavailable vehicle
          </button>
        </div>
      ))}
      {!ids.length && (
        <div className="panel p-10 text-center">
          <h2 className="mb-3 text-2xl font-bold">Your shortlist starts here.</h2>
          <p className="mb-6 text-slate-400">Tap the heart on any vehicle to save it.</p>
          <Button asChild>
            <Link href="/marketplace">Explore vehicles</Link>
          </Button>
        </div>
      )}
    </>
  );
}
