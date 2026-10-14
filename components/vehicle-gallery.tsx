"use client";
import { useRef, useState } from "react";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { ArrowsOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowsOut";
import { MinusIcon } from "@phosphor-icons/react/dist/ssr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise";
import type { Vehicle } from "@/lib/types";
import { ResponsivePhoto } from "./responsive-photo";
import { PhotoCredit } from "./photo-credit";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

type View = { scale: number; x: number; y: number };
const INITIAL_VIEW: View = { scale: 1, x: 0, y: 0 };
export function VehicleGallery({ vehicle: v }: { vehicle: Vehicle }) {
  const [photo, setPhoto] = useState(0);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(INITIAL_VIEW);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ x: number; y: number } | null>(null);
  const multiTouch = useRef(false);
  const lastTouch = useRef(0);
  const pointerType = useRef("mouse");
  const caption = v.example
    ? `Editorial photograph for ${v.name} example`
    : `${v.name}, photo ${photo + 1}`;
  function choose(index: number) {
    const next = (index + v.images.length) % v.images.length;
    setPhoto(next);
    setView(INITIAL_VIEW);
    if (next !== photo) {
      setLoading(true);
      setFailed(false);
    }
  }
  function bound(next: View): View {
    const scale = Math.max(1, Math.min(3, next.scale));
    const x = ((stage.current?.clientWidth || 0) * (scale - 1)) / 2;
    const y = ((stage.current?.clientHeight || 0) * (scale - 1)) / 2;
    return { scale, x: Math.max(-x, Math.min(x, next.x)), y: Math.max(-y, Math.min(y, next.y)) };
  }
  function zoom(amount: number) {
    setView((current) => bound({ ...current, scale: current.scale + amount }));
  }
  const thumbnails = (fullscreen = false) => (
    <div className="gallery-strip mt-3 flex gap-3 overflow-x-auto" aria-label="Vehicle photos">
      {v.images.map((url, i) => (
        <button
          key={i}
          onClick={() => choose(i)}
          aria-label={`View photo ${i + 1}${fullscreen ? " in full screen" : ""}`}
          aria-pressed={photo === i}
          className={`shrink-0 border-2 ${photo === i ? "border-blue-400" : "border-transparent"}`}
        >
          <ResponsivePhoto
            width={100}
            height={70}
            src={url}
            sizes="100px"
            alt=""
            className={`gallery-thumbnail h-16 w-24 ${v.reference ? "object-contain" : "object-cover"}`}
          />
        </button>
      ))}
    </div>
  );
  return (
    <div className="vehicle-gallery">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setView(INITIAL_VIEW);
          setLoading(true);
          setFailed(false);
          pointers.current.clear();
          lastTouch.current = 0;
        }}
      >
        <DialogTrigger asChild>
          <button className="gallery-open" aria-label="Open full-screen photos">
            <ResponsivePhoto
              src={v.images[photo]}
              sizes="(min-width: 1760px) 1000px, (min-width: 1024px) 60vw, 100vw"
              loading="eager"
              alt={caption}
              width={1200}
              height={750}
              fetchPriority="high"
              className={`gallery-photo aspect-[16/10] w-full ${v.reference ? "manufacturer-photo object-contain" : "object-cover"}`}
            />
            <span className="gallery-expand">
              <ArrowsOutIcon aria-hidden="true" focusable="false" size={16} /> Inspect Photos
            </span>
            <span className="gallery-count">
              {photo + 1} / {v.images.length}
            </span>
          </button>
        </DialogTrigger>
        <DialogContent
          className="photo-dialog"
          onKeyDown={(e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === "ArrowRight") {
              e.preventDefault();
              choose(photo + 1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              choose(photo - 1);
            }
            if (e.key === "+" || e.key === "=") {
              e.preventDefault();
              zoom(0.5);
            }
            if (e.key === "-") {
              e.preventDefault();
              zoom(-0.5);
            }
            if (e.key === "0") {
              e.preventDefault();
              setView(INITIAL_VIEW);
            }
          }}
        >
          <div className="photo-dialog-heading">
            <DialogTitle className="pr-12 text-lg font-semibold">{v.name}</DialogTitle>
            <DialogDescription className="mt-1 text-xs text-slate-400">
              Pinch Or Double Tap To Zoom · Drag To Inspect · Swipe To Change Photo
              <span className="sr-only">
                . Arrow keys change photos, plus and minus zoom, and zero resets the view.
              </span>
            </DialogDescription>
          </div>
          <div
            className="photo-inspection-stage"
            ref={stage}
            role="group"
            tabIndex={0}
            aria-label="Photo inspection area"
            aria-busy={loading}
            data-zoom={view.scale.toFixed(2)}
            onDoubleClick={() => {
              if (pointerType.current !== "touch")
                setView((current) => (current.scale > 1 ? INITIAL_VIEW : { scale: 2, x: 0, y: 0 }));
            }}
            onPointerDown={(e) => {
              if (e.pointerType === "mouse" && e.button !== 0) return;
              pointerType.current = e.pointerType;
              e.currentTarget.setPointerCapture(e.pointerId);
              if (pointers.current.size === 0) {
                start.current = { x: e.clientX, y: e.clientY };
                multiTouch.current = false;
              } else multiTouch.current = true;
              pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }}
            onPointerMove={(e) => {
              const previous = pointers.current.get(e.pointerId);
              if (!previous) return;
              const other = [...pointers.current.entries()].find(([id]) => id !== e.pointerId)?.[1];
              if (other) {
                const before = Math.hypot(previous.x - other.x, previous.y - other.y);
                const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
                if (before > 0)
                  setView((current) =>
                    bound({ ...current, scale: (current.scale * after) / before }),
                  );
              } else if (view.scale > 1) {
                setView((current) =>
                  bound({
                    ...current,
                    x: current.x + e.clientX - previous.x,
                    y: current.y + e.clientY - previous.y,
                  }),
                );
              }
              pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }}
            onPointerUp={(e) => {
              pointers.current.delete(e.pointerId);
              if (pointers.current.size || multiTouch.current || !start.current) return;
              const dx = e.clientX - start.current.x,
                dy = e.clientY - start.current.y;
              if (view.scale === 1 && Math.abs(dx) > 50 && Math.abs(dy) < Math.abs(dx) * 0.6) {
                choose(photo + (dx < 0 ? 1 : -1));
              } else if (e.pointerType === "touch" && Math.hypot(dx, dy) < 10) {
                const now = performance.now();
                if (lastTouch.current && now - lastTouch.current < 300) {
                  setView((current) =>
                    current.scale > 1 ? INITIAL_VIEW : { scale: 2, x: 0, y: 0 },
                  );
                  lastTouch.current = 0;
                } else lastTouch.current = now;
              }
            }}
            onPointerCancel={(e) => pointers.current.delete(e.pointerId)}
            onLostPointerCapture={(e) => pointers.current.delete(e.pointerId)}
          >
            <div
              className="photo-pan"
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
            >
              <ResponsivePhoto
                key={photo}
                src={v.images[photo]}
                alt={caption}
                width={1600}
                height={1000}
                sizes={`(min-width: 1800px) ${Math.ceil(1700 * view.scale)}px, ${Math.ceil(95 * view.scale)}vw`}
                inspection
                loading="eager"
                draggable={false}
                className="inspection-photo photo-transition"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setFailed(true);
                }}
              />
            </div>
            {failed && (
              <p className="photo-error" role="alert">
                This Photo Is Unavailable. Try Another Photo Or Ask The Seller For Images.
              </p>
            )}
          </div>
          <div className="photo-dialog-footer">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Previous photo"
                  disabled={v.images.length < 2}
                  onClick={() => choose(photo - 1)}
                >
                  <CaretLeftIcon aria-hidden="true" focusable="false" size={18} />
                </Button>
                <span className="min-w-14 text-center text-xs" aria-live="polite">
                  {photo + 1} / {v.images.length}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Next photo"
                  disabled={v.images.length < 2}
                  onClick={() => choose(photo + 1)}
                >
                  <CaretRightIcon aria-hidden="true" focusable="false" size={18} />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Zoom photo out"
                  disabled={view.scale === 1}
                  onClick={() => zoom(-0.5)}
                >
                  <MinusIcon aria-hidden="true" focusable="false" size={16} />
                </Button>
                <span className="min-w-11 text-center text-xs">
                  {Math.round(view.scale * 100)}%
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Zoom photo in"
                  disabled={view.scale === 3}
                  onClick={() => zoom(0.5)}
                >
                  <PlusIcon aria-hidden="true" focusable="false" size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Reset photo zoom"
                  onClick={() => setView(INITIAL_VIEW)}
                >
                  <ArrowCounterClockwiseIcon aria-hidden="true" focusable="false" size={16} />
                </Button>
              </div>
            </div>
            {v.images.length > 1 && thumbnails(true)}
            <p className="mt-2 text-xs text-slate-400">
              {v.reference
                ? "Manufacturer Model Image · Confirm Available Colours And Options With A Dealer."
                : v.example
                  ? "Editorial Photography · This Example Is Not For Sale."
                  : "Seller Photography · Inspect The Vehicle In Person Before Paying."}
            </p>
            <PhotoCredit id={v.id} />
          </div>
        </DialogContent>
      </Dialog>
      {v.images.length > 1 && thumbnails()}
      <PhotoCredit id={v.id} />
      {v.example && (
        <p className="mt-4 text-xs text-slate-400">
          Editorial photography. Model, trim and condition are not verified.
        </p>
      )}
    </div>
  );
}
