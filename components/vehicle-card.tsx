"use client";
import { ResponsivePhoto } from "./responsive-photo";
import { PhotoCredit } from "./photo-credit";
import Link from "next/link";
import { useState } from "react";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr/Heart";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { useGarage } from "./providers";
import type { Vehicle } from "@/lib/types";
import { zar } from "@/lib/finance";
export function SaveButton({ id, className = "" }: { id: string; className?: string }) {
  const { ids, toggle, ready } = useGarage();
  const [pending, setPending] = useState(false);
  return (
    <button
      className={`save-button p-3 ${className}`}
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
      <HeartIcon
        aria-hidden="true"
        focusable="false"
        size={18}
        weight={ids.includes(id) ? "fill" : "regular"}
        color={ids.includes(id) ? "#3679ff" : "currentColor"}
      />
    </button>
  );
}
export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  return (
    <article className="panel vehicle-card group overflow-hidden" data-reveal-item>
      <div className="relative overflow-hidden">
        <Link href={`/vehicles/${v.id}`} tabIndex={-1} aria-hidden="true">
          <ResponsivePhoto
            src={v.images[0]}
            sizes="(min-width: 1760px) 320px, (min-width: 1200px) 25vw, (min-width: 640px) 45vw, 100vw"
            alt={v.example ? `Editorial photograph for ${v.name} example` : v.name}
            width={800}
            height={500}
            className={`car-photo ${v.reference ? "manufacturer-photo" : ""}`}
            loading="lazy"
          />
        </Link>
        <span className="vehicle-badge absolute left-3 top-3 bg-black/85 px-3 py-2 text-[10px] tracking-wide">
          {v.reference
            ? "New · Manufacturer Reference"
            : v.example
              ? "Illustrative · not for sale"
              : v.sellerType === "DEALER"
                ? "Dealership"
                : "Private seller"}
        </span>
        <SaveButton id={v.id} className="absolute right-3 top-3 bg-black/80" />
      </div>
      <div className="p-5">
        <p className="mb-2 text-xs text-slate-400">
          {v.reference
            ? "New Model"
            : `${v.condition === "NEW" ? "New" : "Used"} · ${v.year} · ${v.km.toLocaleString("en-ZA")} km`}{" "}
          · {v.transmission}
        </p>
        <h3 className="min-h-14 text-xl font-semibold">
          <Link href={`/vehicles/${v.id}`}>{v.name}</Link>
        </h3>
        <p className="mt-3 text-xs text-slate-400">
          {v.reference ? "Manufacturer Reference Price" : "Asking Price"}
        </p>
        <p className="mt-1 text-2xl font-bold">{zar(v.price)}</p>
        <p className="mt-4 flex items-center gap-1 text-xs text-slate-400">
          <MapPinIcon aria-hidden="true" focusable="false" size={13} />
          {v.location}
        </p>
        <Link
          className="mt-5 flex items-center justify-between border-t border-white/10 pt-5 text-sm font-semibold"
          href={`/vehicles/${v.id}`}
        >
          {v.reference ? "Model & Buying Options" : "Vehicle & Ownership Cost"}{" "}
          <ArrowUpRightIcon aria-hidden="true" focusable="false" size={18} />
        </Link>
        <PhotoCredit id={v.id} />
      </div>
    </article>
  );
}
