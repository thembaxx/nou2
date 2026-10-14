"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { MoonIcon } from "@phosphor-icons/react/dist/ssr/Moon";
import { SunIcon } from "@phosphor-icons/react/dist/ssr/Sun";
type ThemeMode = "system" | "light" | "dark";
const KEY = "carpur-theme-v1";
const Context = createContext<{
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}>({ mode: "system", resolved: "dark", setMode: () => {} });
export function ThemePreferences({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === "light" || stored === "dark") setModeState(stored);
    } catch {
      /* Theme remains available for this visit. */
    }
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const refresh = () => {
      const theme = mode === "system" ? (media.matches ? "light" : "dark") : mode;
      setResolved(theme);
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    };
    refresh();
    media.addEventListener?.("change", refresh);
    return () => media.removeEventListener?.("change", refresh);
  }, [mode]);
  function setMode(next: ThemeMode) {
    setModeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* Active for this visit. */
    }
  }
  return <Context.Provider value={{ mode, resolved, setMode }}>{children}</Context.Provider>;
}
export function ThemeToggle() {
  const { resolved, setMode } = useContext(Context);
  return (
    <button
      className="theme-toggle flex size-11 shrink-0 items-center justify-center rounded-xl"
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
      onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
    >
      {resolved === "dark" ? (
        <SunIcon aria-hidden="true" focusable="false" size={19} />
      ) : (
        <MoonIcon aria-hidden="true" focusable="false" size={19} />
      )}
    </button>
  );
}
export function ThemePreferenceControl() {
  const { mode, setMode } = useContext(Context);
  return (
    <label className="label w-full sm:w-48">
      Appearance
      <select
        aria-label="Appearance"
        className="field"
        value={mode}
        onChange={(e) => setMode(e.target.value as ThemeMode)}
      >
        <option value="system">Use Device Theme</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
