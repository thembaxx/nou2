"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page">
      <h1 className="page-title mb-6">
        A MOMENTARY
        <br />
        DETOUR.
      </h1>
      <p className="mb-8 text-slate-400">We could not load this page. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
