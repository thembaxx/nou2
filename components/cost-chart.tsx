"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { zar } from "@/lib/finance";
export default function CostChart({
  data,
}: {
  data: { horizon: string; cost: number; second?: number }[];
}) {
  return (
    <div
      className="h-64 w-full min-w-0"
      role="img"
      aria-label="Estimated ownership cost chart. Exact values are in the adjacent table."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#354052" vertical={false} />
          <XAxis dataKey="horizon" stroke="#a8b3c6" />
          <YAxis stroke="#a8b3c6" tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={50} />
          <Tooltip
            formatter={(v) => zar(Number(v))}
            contentStyle={{ background: "#151b25", border: "1px solid #44516b", color: "white" }}
          />
          <Bar dataKey="cost" name="Vehicle 1" fill="#3679ff" isAnimationActive={false} />
          {data.some((v) => v.second !== undefined) && (
            <Bar dataKey="second" name="Vehicle 2" fill="#a8c9ff" isAnimationActive={false} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
