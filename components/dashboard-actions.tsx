"use client";
import { useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
export function DashboardActions({ vehicle: v }: { vehicle: Vehicle }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function mutate(status?: string) {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/listings/${v.id}`, {
        method: status ? "PATCH" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: status ? JSON.stringify({ ...v, status }) : undefined,
      });
      if (response.ok) window.location.reload();
      else setError((await response.json()).error);
    } catch {
      setError("Could not update the listing. Try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/sell?id=${v.id}`}>Edit</Link>
        </Button>
        {v.status === "PUBLISHED" ? (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => mutate("SOLD")}>
            Mark sold
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => mutate("PUBLISHED")}
          >
            Publish
          </Button>
        )}
        {v.status !== "ARCHIVED" && (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => mutate("ARCHIVED")}>
            Archive
          </Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="mb-3 text-xl font-bold">Delete this listing?</DialogTitle>
            <DialogDescription className="mb-6 text-sm text-slate-400">
              This removes {v.name}, its photos and associated enquiries permanently.
            </DialogDescription>
            <Button variant="destructive" disabled={pending} onClick={() => mutate()}>
              Delete listing
            </Button>
            {error && (
              <p className="notice mt-4" role="alert">
                {error}
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
