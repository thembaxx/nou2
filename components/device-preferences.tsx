"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type VisualMode = "auto" | "reduced" | "enhanced";
export type VisualTier = "reduced" | "standard" | "enhanced";
type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: Connection };
type DeviceProfile = {
  tier: VisualTier;
  reducedMotion: boolean;
  saveData: boolean;
  maxDpr: number;
};
type Preferences = DeviceProfile & {
  mode: VisualMode;
  ready: boolean;
  setMode: (mode: VisualMode) => void;
};
const defaultProfile: DeviceProfile = {
  tier: "standard",
  reducedMotion: false,
  saveData: false,
  maxDpr: 1.5,
};
const Context = createContext<Preferences>({
  ...defaultProfile,
  mode: "auto",
  ready: false,
  setMode: () => {},
});
const KEY = "carpur-visuals-v1";
function readProfile(mode: VisualMode, initialSaveData: boolean): DeviceProfile {
  const device = navigator as DeviceNavigator;
  const memory = device.deviceMemory;
  const cores = device.hardwareConcurrency;
  const saveData = device.connection?.saveData ?? initialSaveData;
  const slowConnection = /^(slow-2g|2g|3g)$/.test(device.connection?.effectiveType || "");
  const modestHardware = (memory !== undefined && memory <= 4) || (cores > 0 && cores <= 4);
  const capableHardware = (memory ?? 0) >= 8 && cores >= 8;
  const automatic =
    saveData || slowConnection || modestHardware
      ? "reduced"
      : capableHardware
        ? "enhanced"
        : "standard";
  const tier = mode === "auto" ? automatic : mode;
  return {
    tier,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData,
    maxDpr: tier === "reduced" ? 1 : tier === "enhanced" ? 2 : 1.5,
  };
}
export function DevicePreferences({
  children,
  initialSaveData = false,
}: {
  children: React.ReactNode;
  initialSaveData?: boolean;
}) {
  const [mode, setModeState] = useState<VisualMode>("auto");
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<DeviceProfile>({
    ...defaultProfile,
    tier: initialSaveData ? "reduced" : "standard",
    saveData: initialSaveData,
  });
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "reduced" || saved === "enhanced") setModeState(saved);
    } catch {
      /* The current visit still supports preferences. */
    }
    setReady(true);
    const storageChanged = (event: StorageEvent) => {
      if (event.key === KEY)
        setModeState(
          event.newValue === "reduced" || event.newValue === "enhanced" ? event.newValue : "auto",
        );
    };
    window.addEventListener("storage", storageChanged);
    return () => window.removeEventListener("storage", storageChanged);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const refresh = () => setProfile(readProfile(mode, initialSaveData));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as DeviceNavigator).connection;
    refresh();
    media.addEventListener?.("change", refresh);
    connection?.addEventListener("change", refresh);
    return () => {
      media.removeEventListener?.("change", refresh);
      connection?.removeEventListener("change", refresh);
    };
  }, [mode, ready, initialSaveData]);
  useEffect(() => {
    document.documentElement.dataset.visualTier = profile.tier;
    document.documentElement.dataset.motion =
      profile.reducedMotion || mode === "reduced"
        ? "reduced"
        : profile.tier === "enhanced"
          ? "full"
          : "light";
  }, [profile.tier, profile.reducedMotion, mode]);
  function setMode(next: VisualMode) {
    setModeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* Preferences remain active for this visit. */
    }
  }
  return (
    <Context.Provider value={{ ...profile, mode, ready, setMode }}>{children}</Context.Provider>
  );
}
export const useDevicePreferences = () => useContext(Context);
export function VisualPreferenceControl() {
  const { mode, setMode, ready } = useDevicePreferences();
  return (
    <label className="label w-full sm:w-48">
      Visual Quality
      <select
        aria-label="Visual quality"
        className="field"
        value={mode}
        disabled={!ready}
        onChange={(event) => setMode(event.target.value as VisualMode)}
      >
        <option value="auto">Automatic</option>
        <option value="reduced">Save Battery</option>
        <option value="enhanced">High Detail</option>
      </select>
      <span className="text-[11px] leading-relaxed">
        Automatic adapts to your device and connection.
      </span>
    </label>
  );
}
