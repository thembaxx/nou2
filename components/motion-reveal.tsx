"use client";
import { useEffect } from "react";
import { animate } from "motion";
export default function MotionReveal({ target }: { target: HTMLDivElement | null }) {
  useEffect(() => {
    if (!target) return;
    const controls = animate(
      target,
      { opacity: [0.85, 1], y: [14, 0] },
      { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    );
    const reset = () => {
      target.style.removeProperty("opacity");
      target.style.removeProperty("transform");
    };
    controls.then(reset);
    return () => {
      controls.stop();
      reset();
    };
  }, [target]);
  return null;
}
