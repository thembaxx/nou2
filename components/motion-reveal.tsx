"use client";
import { useEffect } from "react";
import { animate, stagger } from "motion";
export default function MotionReveal({ target }: { target: HTMLDivElement | null }) {
  useEffect(() => {
    if (!target) return;
    const items = Array.from(target.querySelectorAll<HTMLElement>(":scope > [data-reveal-item]"));
    const grouped = target.classList.contains("vehicle-grid") || items.length > 0;
    const batches = new Set<() => void>();
    const reveal = (elements: HTMLElement[]) => {
      const visible = elements
        .filter((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.top < innerHeight + 50 && bounds.bottom > 0;
        })
        .slice(0, 8);
      if (!visible.length) return;
      const controls = animate(
        visible,
        { opacity: [0.78, 1], y: [24, 0] },
        { duration: 0.65, delay: stagger(0.065), ease: [0.22, 1, 0.36, 1] },
      );
      const reset = () =>
        visible.forEach((element) => {
          element.style.removeProperty("opacity");
          element.style.removeProperty("transform");
        });
      const cleanup = () => {
        controls.stop();
        reset();
      };
      batches.add(cleanup);
      controls.then(() => {
        reset();
        batches.delete(cleanup);
      });
    };
    reveal(grouped ? items : [target]);
    const observer = grouped
      ? new MutationObserver((records) => {
          const added = records
            .flatMap((record) => Array.from(record.addedNodes))
            .filter(
              (node): node is HTMLElement =>
                node instanceof HTMLElement && node.hasAttribute("data-reveal-item"),
            );
          reveal(added);
        })
      : null;
    observer?.observe(target, { childList: true });
    return () => {
      observer?.disconnect();
      batches.forEach((cleanup) => cleanup());
    };
  }, [target]);
  return null;
}
