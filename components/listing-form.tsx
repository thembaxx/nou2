"use client";
import { useState } from "react";
import { useDevicePreferences } from "./device-preferences";
import { Button } from "./ui/button";
import { BODY_TYPES, FUEL_TYPES, MAKES, TRANSMISSIONS, energyUnit } from "@/lib/vehicle-options";
import type { Vehicle } from "@/lib/types";
type ListingData = Omit<Vehicle, "id" | "example">;
async function compressPhoto(file: File, maxEdge: number): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10000000)
    throw new Error("Use JPEG, PNG or WebP images under 10 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Photo processing is unavailable in this browser. Use an HTTPS image URL.");
    for (const edge of [maxEdge, Math.round(maxEdge * 0.75)]) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.88, 0.8, 0.72]) {
        const data = canvas.toDataURL("image/webp", quality);
        if (data.length <= 250000) return data;
      }
    }
    throw new Error("This photograph is too detailed. Try a smaller image.");
  } finally {
    bitmap.close();
  }
}
export function ListingForm({ initial }: { initial?: Vehicle }) {
  const { tier } = useDevicePreferences();
  const [form, setForm] = useState<ListingData>(
    initial || {
      name: "",
      make: "",
      year: new Date().getFullYear(),
      price: 0,
      km: 0,
      condition: "USED",
      fuel: 7,
      fuelType: "Petrol",
      transmission: "Automatic",
      bodyType: "Sedan",
      images: [],
      location: "",
      sellerType: "PRIVATE",
      sellerName: "",
      description: "",
      status: "DRAFT",
    },
  );
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [processing, setProcessing] = useState(false);
  const change = <K extends keyof ListingData>(key: K, value: ListingData[K]) =>
    setForm((v) => ({ ...v, [key]: value }));
  function text(key: "name" | "make" | "location" | "sellerName", label: string) {
    return (
      <label className="label">
        {label}
        <input
          className="field"
          list={key === "make" ? "vehicle-makes" : undefined}
          required
          minLength={2}
          maxLength={100}
          value={form[key]}
          onChange={(e) => change(key, e.target.value)}
        />
      </label>
    );
  }
  function number(
    key: "year" | "price" | "km" | "fuel",
    label: string,
    min: number,
    max: number,
    step = 1,
  ) {
    return (
      <label className="label">
        {label}
        <input
          className="field"
          type="number"
          required
          min={min}
          max={max}
          step={step}
          value={form[key]}
          onChange={(e) => change(key, Number(e.target.value))}
        />
      </label>
    );
  }
  async function submit(status: string) {
    setPending(true);
    setError("");
    try {
      const response = await fetch(initial ? `/api/listings/${initial.id}` : "/api/listings", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Could not save the listing.");
      else window.location.assign("/dashboard");
    } catch {
      setError("Could not reach Carpur. Your form is still here; try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      className="panel p-6 md:p-9"
      onSubmit={(e) => {
        e.preventDefault();
        void submit("PUBLISHED");
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="label">
          Vehicle condition
          <select
            className="field"
            value={form.condition}
            onChange={(e) => change("condition", e.target.value as "NEW" | "USED")}
          >
            <option value="NEW">New</option>
            <option value="USED">Used / second hand</option>
          </select>
        </label>
        <datalist id="vehicle-makes">
          {MAKES.map((make) => (
            <option key={make} value={make} />
          ))}
        </datalist>
        {text("name", "Make, model & trim")}
        {text("make", "Make")}
        {number("year", "Year", 1950, new Date().getFullYear() + 1)}
        {number("price", "Asking price (R)", 1000, 10000000)}
        {number("km", "Mileage (km)", 0, 2000000)}
        {number("fuel", `Consumption (${energyUnit(form.fuelType)} / 100 km)`, 0, 100, 0.1)}
        {text("location", "City / suburb")}
        {text("sellerName", "Seller or dealership name")}
        <label className="label">
          Seller category
          <select
            className="field"
            value={form.sellerType}
            onChange={(e) => change("sellerType", e.target.value as "PRIVATE" | "DEALER")}
          >
            <option value="PRIVATE">Private seller</option>
            <option value="DEALER">Dealership</option>
          </select>
        </label>
        {(
          [
            ["fuelType", "Fuel type", FUEL_TYPES],
            ["transmission", "Transmission", TRANSMISSIONS],
            ["bodyType", "Body style", BODY_TYPES],
          ] as const
        ).map(([key, label, values]) => (
          <label key={key} className="label">
            {label}
            <select
              className="field"
              value={form[key]}
              onChange={(e) => change(key, e.target.value)}
            >
              {values.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="label mt-6">
        Describe condition, service history and features
        <textarea
          className="field"
          rows={6}
          minLength={30}
          maxLength={5000}
          required
          value={form.description}
          onChange={(e) => change("description", e.target.value)}
        />
      </label>
      <fieldset className="mt-7 border-t border-white/15 pt-6">
        <legend className="text-lg font-semibold">Vehicle photography</legend>
        <p className="my-4 text-xs text-slate-400">
          Add up to 6 photographs you own or have permission to use. Uploads are compressed in your
          browser. Photos are public once you publish. Remove number plates and personal details if
          needed.
        </p>
        <label className="label">
          Upload photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={processing || form.images.length >= 6}
            className="field"
            onChange={async (e) => {
              const files = [...(e.target.files || [])];
              setError("");
              setProcessing(true);
              try {
                if (form.images.length + files.length > 6)
                  throw new Error("Use a maximum of 6 photos.");
                const photos: string[] = [];
                const maxEdge = tier === "reduced" ? 1200 : tier === "enhanced" ? 2400 : 1600;
                for (const file of files) photos.push(await compressPhoto(file, maxEdge));
                if ([...form.images, ...photos].join("").length > 1000000)
                  throw new Error(
                    "Photos must total less than 1 MB. Remove one or use smaller images.",
                  );
                setForm((v) => ({ ...v, images: [...v.images, ...photos] }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not process photos.");
              } finally {
                setProcessing(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        <div className="mt-4 flex items-end gap-3">
          <label className="label flex-1">
            Or an HTTPS photo URL
            <input
              className="field"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </label>
          <Button
            type="button"
            variant="outline"
            disabled={form.images.length >= 6}
            onClick={() => {
              try {
                if (new URL(url).protocol !== "https:") throw new Error();
                change("images", [...form.images, url]);
                setUrl("");
                setError("");
              } catch {
                setError("Enter a valid HTTPS image URL.");
              }
            }}
          >
            Add photo
          </Button>
        </div>
        {processing && (
          <p role="status" className="mt-3 text-sm">
            Compressing photos…
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {form.images.map((photo, i) => (
            <div key={i}>
              <img
                src={photo}
                alt={`Listing photo ${i + 1}`}
                width={400}
                height={260}
                className="h-32 w-full object-cover"
              />
              <button
                type="button"
                className="mt-2 text-xs text-blue-300"
                onClick={() =>
                  change(
                    "images",
                    form.images.filter((_, n) => n !== i),
                  )
                }
              >
                Remove photo {i + 1}
              </button>
            </div>
          ))}
        </div>
      </fieldset>
      <p className="notice mt-6">
        You confirm that the vehicle exists, you are authorised to sell it and your description is
        accurate. Carpur does not verify seller identities or vehicle condition. Do not put identity
        documents, banking details or your home address in a listing.
      </p>
      {error && (
        <p className="notice mt-5" role="alert">
          {error}
        </p>
      )}
      <div className="mt-7 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending || processing}>
          {pending ? "Saving…" : initial ? "Save & publish" : "Publish listing"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending || processing}
          onClick={() => {
            const element = document.querySelector("form");
            if (element?.reportValidity()) void submit("DRAFT");
          }}
        >
          Save as draft
        </Button>
      </div>
    </form>
  );
}
