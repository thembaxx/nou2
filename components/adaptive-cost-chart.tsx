"use client";
import dynamic from "next/dynamic";
import { OptionalVisualBoundary } from "./optional-visual-boundary";
import { zar } from "@/lib/finance";
import { useDevicePreferences } from "./device-preferences";
import { useViewportGate } from "./viewport-gate";
type Data = { horizon: string; cost: number; second?: number }[];
function BasicChart({ data }: { data: Data }) {
  const max = Math.max(1, ...data.flatMap((row) => [row.cost, row.second ?? 0]));
  return (
    <figure className="basic-cost-chart" aria-label="Estimated net ownership costs">
      <figcaption className="mb-1 text-xs text-slate-400">Net Ownership Cost</figcaption>
      {data.map((row) => (
        <div key={row.horizon} className="mb-3">
          <p className="mb-1 text-xs text-slate-300">{row.horizon}</p>
          {[row.cost, ...(row.second === undefined ? [] : [row.second])].map((value, i) => (
            <div key={i} className="mb-1 grid grid-cols-[1fr_auto] items-center gap-3">
              <div className="h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                <div
                  className={`h-full rounded-full ${i === 0 ? "bg-blue-500" : "bg-blue-200"}`}
                  style={{ width: `${(Math.max(0, value) / max) * 100}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-slate-300">
                <span className="sr-only">Vehicle {i + 1}: </span>
                {zar(value)}
              </span>
            </div>
          ))}
        </div>
      ))}
    </figure>
  );
}
const RichChart = dynamic(() => import("./cost-chart"), {
  ssr: false,
  loading: () => <div className="h-64" aria-label="Loading chart" />,
});
export function AdaptiveCostChart({ data }: { data: Data }) {
  const { tier } = useDevicePreferences();
  const { ref, visible } = useViewportGate();
  const enhanced = tier === "enhanced" && visible;
  return (
    <div
      ref={ref}
      data-chart-kind={enhanced ? "enhanced" : "basic"}
      className="my-6 min-h-64 min-w-0"
    >
      {enhanced ? (
        <OptionalVisualBoundary fallback={<BasicChart data={data} />}>
          <RichChart data={data} />
        </OptionalVisualBoundary>
      ) : (
        <BasicChart data={data} />
      )}
    </div>
  );
}
