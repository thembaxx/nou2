"use client";
import dynamic from "next/dynamic";
import { OptionalVisualBoundary } from "./optional-visual-boundary";
import { useDevicePreferences } from "./device-preferences";
import { useViewportGate } from "./viewport-gate";
const MotionReveal = dynamic(() => import("./motion-reveal"), { ssr: false });
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const { tier, reducedMotion, ready, mode } = useDevicePreferences();
  const { ref, visible } = useViewportGate({ margin: "0px" });
  return (
    <div
      ref={ref}
      className={`${className || ""} ${visible && ready && !reducedMotion && mode !== "reduced" && tier !== "enhanced" ? "reveal-light" : ""}`}
    >
      {children}
      {ready && visible && tier === "enhanced" && !reducedMotion && (
        <OptionalVisualBoundary>
          <MotionReveal target={ref.current} />
        </OptionalVisualBoundary>
      )}
    </div>
  );
}
