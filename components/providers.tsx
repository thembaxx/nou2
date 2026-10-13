"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
type User = { id: string; name: string; email: string } | null;
type GarageContext = {
  user: User;
  ready: boolean;
  ids: string[];
  error: string;
  toggle: (id: string) => Promise<void>;
};
const Context = createContext<GarageContext>({
  user: null,
  ready: false,
  ids: [],
  error: "",
  toggle: async () => {},
});
export function Providers({
  children,
  user,
  savedIds,
}: {
  children: React.ReactNode;
  user: User;
  savedIds: string[];
}) {
  const [ids, setIds] = useState(savedIds);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const local: unknown = JSON.parse(localStorage.getItem("carpur-garage-v1") || "[]");
      const localIds = Array.isArray(local)
        ? local.filter(
            (v): v is string => typeof v === "string" && (!user || v.startsWith("example-")),
          )
        : [];
      setIds([...new Set([...savedIds, ...localIds])]);
    } catch {
      setError("Browser storage is unavailable. Sign in to save live vehicles.");
    }
    setReady(true);
  }, [user, savedIds]);
  async function toggle(id: string) {
    const saved = ids.includes(id);
    setError("");
    if (user && !id.startsWith("example-")) {
      try {
        const response = await fetch(`/api/garage/${encodeURIComponent(id)}`, {
          method: saved ? "DELETE" : "POST",
          keepalive: true,
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Could not save vehicle.");
          return;
        }
      } catch {
        setError("Could not reach Carpur. Try again.");
        return;
      }
    }
    setIds((previous) => {
      const next = saved ? previous.filter((v) => v !== id) : [...new Set([...previous, id])];
      try {
        localStorage.setItem(
          "carpur-garage-v1",
          JSON.stringify(next.filter((v) => !user || v.startsWith("example-"))),
        );
      } catch {
        setError("Browser storage is unavailable. This save lasts until you leave the page.");
      }
      return next;
    });
  }
  return (
    <MotionConfig reducedMotion="user">
      <Context.Provider value={{ user, ready, ids, error, toggle }}>{children}</Context.Provider>
    </MotionConfig>
  );
}
export const useGarage = () => useContext(Context);
