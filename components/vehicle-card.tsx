"use client";
import { PhotoCredit } from "./photo-credit";
import Link from "next/link";
import { useState } from "react";
import { Heart, MapPin, ArrowUpRight } from "lucide-react";
import { useGarage } from "./providers";
import type { Vehicle } from "@/lib/types";
import { zar } from "@/lib/finance";
export function SaveButton({ id, className = "" }: { id: string; className?: string }) {
  const { ids, toggle, ready } = useGarage();
  const [pending, setPending] = useState(false);
  return (
    <button
      className={`p-3 ${className}`}
      aria-label={ids.includes(id) ? "Remove from garage" : "Save to garage"}
      aria-pressed={ids.includes(id)}
      disabled={!ready || pending}
      onClick={async () => {
        setPending(true);
        try {
          await toggle(id);
        } finally {
          setPending(false);
        }
      }}
    >
      <Heart size={18} fill={ids.includes(id) ? "#3679ff" : "none"} />
    </button>
  );
}
export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  return (
    <article className="panel group overflow-hidden">
      <div className="relative overflow-hidden">
        <Link href={`/vehicles/${v.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={v.images[0]}
            alt={v.example ? `Editorial photograph for ${v.name} example` : v.name}
            width={800}
            height={500}
            className="car-photo transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>
        <span className="absolute left-3 top-3 bg-black/85 px-3 py-2 text-[10px] uppercase tracking-widest">
          {v.example
            ? "Illustrative · not for sale"
            : v.sellerType === "DEALER"
              ? "Dealership"
              : "Private seller"}
        </span>
        <SaveButton id={v.id} className="absolute right-3 top-3 bg-black/80" />
      </div>
      <div className="p-5">
        <p className="mb-2 text-xs text-slate-400">
          {v.year} · {v.km.toLocaleString("en-ZA")} km · {v.transmission}
        </p>
        <h3 className="min-h-14 text-xl font-semibold">
          <Link href={`/vehicles/${v.id}`}>{v.name}</Link>
        </h3>
        <p className="mt-3 text-2xl font-bold">{zar(v.price)}</p>
        <p className="mt-4 flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={13} />
          {v.location}
        </p>
        <Link
          className="mt-5 flex items-center justify-between border-t border-white/10 pt-5 text-sm font-semibold"
          href={`/vehicles/${v.id}`}
        >
          Vehicle & ownership cost <ArrowUpRight size={18} />
        </Link>
        <PhotoCredit id={v.id} />
      </div>
    </article>
  );
}
