"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus, RotateCcw } from "lucide-react";
import { realModels } from "@/lib/real-models";
import { useDevicePreferences } from "./device-preferences";
import { useViewportGate } from "./viewport-gate";
import { OptionalVisualBoundary } from "./optional-visual-boundary";
import { Button } from "./ui/button";
const Scene = dynamic(() => import("./vehicle-3d"), { ssr: false });
const colours = [
  ["Alpine White", "#e1e7ed"],
  ["Atlantic Blue", "#3779bd"],
  ["Graphite", "#455260"],
  ["Signal Red", "#bb384c"],
];
export function VehicleExplorer({ initialModelId = "bmw-m3-e30" }: { initialModelId?: string }) {
  const [modelId, setModelId] = useState(initialModelId);
  const model = realModels.find((m) => m.id === modelId)!;
  const [colour, setColour] = useState(colours[3][1]);
  const [angle, setAngle] = useState(0.35);
  const [elevation, setElevation] = useState(1.8);
  const [distance, setDistance] = useState(4.7);
  const [interior, setInterior] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [requested, setRequested] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [webgl, setWebgl] = useState(false);
  const { tier, mode, ready, reducedMotion, saveData } = useDevicePreferences();
  const { ref, visible } = useViewportGate({ once: false, margin: "80px" });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  useEffect(() => {
    setWebgl(typeof window.WebGL2RenderingContext === "function");
    const refresh = () => setForeground(!document.hidden);
    refresh();
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);
  const active =
    model.provider === "local" &&
    ready &&
    webgl &&
    visible &&
    foreground &&
    (requested || tier !== "reduced") &&
    mode !== "reduced";
  useEffect(() => {
    setSceneReady(false);
  }, [active, modelId]);
  useEffect(() => {
    if (!visible || !foreground || reducedMotion || !active) {
      setPlaying(false);
      setDragging(false);
      pointers.current.clear();
    }
  }, [visible, foreground, reducedMotion, active]);
  const previewIndex = Math.min(
    7,
    Math.floor(((Math.atan2(Math.sin(angle), Math.cos(angle)) + Math.PI) / (2 * Math.PI)) * 8),
  );
  const poster = (
    <div className="real-model-poster">
      <img
        src={`/models/${model.id}-view-${previewIndex}.webp`}
        srcSet={
          saveData
            ? undefined
            : `/models/${model.id}-view-${previewIndex}.webp 800w, /models/${model.id}-view-${previewIndex}-1600.webp 1600w`
        }
        sizes="(min-width: 1760px) 750px, (min-width: 1024px) 45vw, 100vw"
        style={{ transform: `scale(${4.7 / distance})` }}
        alt={`${model.name} — rendering of the actual artist model`}
        width={1600}
        height={1000}
        loading="eager"
      />
      <span className="text-xs text-slate-300">{model.name} · 360° Model Preview</span>
    </div>
  );
  return (
    <div className="explorer panel" ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <p className="eyebrow">Real Car 3D Studio</p>
        <span className="text-[11px] text-blue-200">
          {model.name} · {model.year || "Artist Model"}
        </span>
      </div>
      <div className="px-5 pt-4">
        <label className="label">
          Choose A Real Car
          <select
            className="field"
            aria-label="3D car model"
            value={modelId}
            onChange={(e) => {
              setModelId(e.target.value);
              setPlaying(false);
              setRequested(false);
              setInterior(false);
              setAngle(0.35);
              setDistance(4.7);
              setElevation(1.8);
              pointers.current.clear();
              setDragging(false);
            }}
          >
            {realModels.map((m) => (
              <option value={m.id} key={m.id}>
                {m.name}
                {m.provider === "sketchfab" ? " · External Source" : " · Local 3D"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="scene-frame explorer-stage"
        aria-label={`Interactive ${model.name}; drag to rotate and pinch to zoom`}
        data-scene-ready={active && sceneReady ? "true" : "false"}
        onPointerDown={(e) => {
          if (model.provider !== "local") return;
          if (e.pointerType === "mouse" && e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setPlaying(false);
          setDragging(true);
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }}
        onPointerMove={(e) => {
          const previous = pointers.current.get(e.pointerId);
          if (!previous) return;
          const other = [...pointers.current.entries()].find(([id]) => id !== e.pointerId)?.[1];
          if (other) {
            const before = Math.hypot(previous.x - other.x, previous.y - other.y),
              after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
            setDistance((v) => Math.max(3.4, Math.min(7, v + (before - after) * 0.012)));
          } else {
            setAngle((v) => {
              const next = v + (e.clientX - previous.x) * 0.009;
              return Math.atan2(Math.sin(next), Math.cos(next));
            });
            setElevation((v) => Math.max(1, Math.min(4, v + (e.clientY - previous.y) * 0.009)));
          }
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          setDragging(pointers.current.size > 0);
        }}
        onPointerCancel={(e) => {
          pointers.current.delete(e.pointerId);
          setDragging(pointers.current.size > 0);
        }}
        onLostPointerCapture={(e) => {
          pointers.current.delete(e.pointerId);
          setDragging(pointers.current.size > 0);
        }}
      >
        {model.provider === "local" ? (
          <>
            {active ? (
              <OptionalVisualBoundary key={model.id}>
                <Scene
                  key={model.id}
                  asset={"asset" in model ? model.asset : ""}
                  paint={"paint" in model ? model.paint : ""}
                  angle={angle}
                  elevation={elevation}
                  distance={distance}
                  colour={colour}
                  interior={interior}
                  animate={playing && !reducedMotion}
                  dragging={dragging}
                  onReady={() => setSceneReady(true)}
                  onOrbit={setAngle}
                />
              </OptionalVisualBoundary>
            ) : (
              poster
            )}
            {active && !sceneReady && <div className="scene-loading">{poster}</div>}
          </>
        ) : (
          <div className="relative flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
            <img
              src="/models/toyota-corolla-cross-source.webp"
              alt="Toyota Corolla Cross — artist model preview"
              className="max-h-48 w-full object-contain"
              width={640}
              height={360}
            />
            <Button asChild>
              <a href={model.source} target="_blank" rel="noreferrer">
                Open Toyota 3D At Source ↗
              </a>
            </Button>
            <p className="text-xs text-slate-300">
              The Corolla Cross model is hosted on Sketchfab. Local rendering is available for the
              Ferrari and BMW.
            </p>
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        {model.provider === "local" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">Drag to orbit · Pinch to zoom</p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Zoom in"
                  onClick={() => setDistance((v) => Math.max(3.4, v - 0.4))}
                >
                  <Plus size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Zoom out"
                  onClick={() => setDistance((v) => Math.min(7, v + 0.4))}
                >
                  <Minus size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Reset view"
                  onClick={() => {
                    setPlaying(false);
                    setAngle(0.35);
                    setDistance(4.7);
                    setElevation(1.8);
                  }}
                >
                  <RotateCcw size={16} />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Camera views">
              {[
                ["Three Quarter", 0.35],
                ["Side Profile", model.id === "bmw-m3-e30" ? -0.79 : 0.79],
                ["Opposite Quarter", -2.8],
              ].map(([label, viewAngle]) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlaying(false);
                    setAngle(Number(viewAngle));
                    setElevation(1.8);
                    setDistance(4.7);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            {!active && ready && (
              <div className="mt-3 text-xs text-slate-400">
                {webgl ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mode === "reduced"}
                    onClick={() => setRequested(true)}
                  >
                    Enable Real 3D View
                  </Button>
                ) : (
                  "3D is unavailable in this browser. The actual-model preview and all shopping tools remain available."
                )}
                {mode === "reduced" &&
                  " Choose Automatic or High Detail in Visual Quality to enable 3D."}
              </div>
            )}
            <label className="label mt-3">
              Rotate Model
              <input
                aria-label="Rotate model"
                type="range"
                min={-3.14}
                max={3.14}
                step={0.01}
                value={Math.max(-3.14, Math.min(3.14, angle))}
                onChange={(e) => {
                  setPlaying(false);
                  setAngle(Number(e.target.value));
                }}
              />
            </label>
            <div className="my-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1" aria-label="Preview paint colour">
                {colours.map(([name, hex]) => (
                  <button
                    key={hex}
                    className="colour-option"
                    aria-label={name}
                    disabled={!active}
                    aria-pressed={colour === hex}
                    onClick={() => setColour(hex)}
                  >
                    <span style={{ background: hex }} />
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!active}
                  aria-pressed={interior}
                  onClick={() => setInterior((v) => !v)}
                >
                  {interior ? "Exterior View" : "View Interior"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!active || reducedMotion}
                  aria-pressed={playing}
                  onClick={() => setPlaying((v) => !v)}
                >
                  {playing ? "Pause Motion" : "Auto Rotate"}
                </Button>
              </div>
            </div>
          </>
        )}
        <p className="mt-3 text-xs leading-relaxed text-slate-300">{model.note}</p>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
          3D: {model.author} ·{" "}
          <a href={model.source} target="_blank" rel="noreferrer" className="underline">
            Model Source
          </a>{" "}
          ·{" "}
          <a href={model.licenseUrl} target="_blank" rel="noreferrer" className="underline">
            {model.license}
          </a>
          . Artist geometry is not a scan of an individual car. Preview paint is illustrative.
        </p>
        <Button className="mt-4 w-full" asChild>
          <Link
            href={`/marketplace?${model.make === "Toyota" ? "" : "inventory=sellers&"}q=${encodeURIComponent(model.make === "Toyota" ? "Corolla Cross" : model.make)}`}
          >
            Find {model.make} Cars
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
