"use client";
import { useEffect } from "react";
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Offline support is optional; the marketplace remains available. */
      });
    }
  }, []);
  return null;
}
