"use client";
import { useState, type ComponentProps } from "react";
import Image from "next/image";
import { useDevicePreferences } from "./device-preferences";
export function ResponsivePhoto({
  src,
  sizes = "100vw",
  loading = "lazy",
  decoding = "async",
  inspection = false,
  ...props
}: ComponentProps<"img"> & { src: string; inspection?: boolean }) {
  const { saveData, mode } = useDevicePreferences();
  const [unoptimised, setUnoptimised] = useState("");
  const match = src.match(/^\/images\/(hero|bmw|mercedes|golf|toyota)\.webp$/);
  const name = match?.[1];
  const manufacturer = src.startsWith("https://assets.cdntoyota.co.za/toyotacms23/attachments/");
  // Image resolution follows the rendered size and pixel density, not CPU/GPU power.
  // Only public manufacturer imagery is optimised; authenticated seller photos stay private.
  const original = manufacturer ? src.replace(/\.(mobile|thumbnail)\.png$/, ".desktop.png") : src;
  if (manufacturer && unoptimised !== src) {
    return (
      <Image
        {...props}
        src={original}
        alt={props.alt || ""}
        width={Number(props.width) || 1200}
        height={Number(props.height) || 750}
        sizes={sizes}
        quality={inspection ? 90 : saveData || mode === "reduced" ? 65 : 85}
        loading={loading}
        decoding={decoding}
        onError={() => setUnoptimised(src)}
      />
    );
  }
  const widths =
    saveData && !inspection
      ? [320, 640]
      : name === "hero"
        ? [320, 640, 960, 1600, 2560]
        : inspection
          ? name === "golf"
            ? [640, 960, 1600, 2400]
            : [640, 960, 1600, 2400, 3200]
          : [320, 640, 960, 1600, 2400];
  return (
    <img
      {...props}
      src={original}
      sizes={name ? sizes : undefined}
      srcSet={
        name
          ? widths.map((width) => `/images/${name}-${width}.webp ${width}w`).join(", ")
          : undefined
      }
      loading={loading}
      decoding={decoding}
    />
  );
}
export function HeroPhoto() {
  return (
    <ResponsivePhoto
      src="/images/hero.webp"
      alt=""
      aria-hidden="true"
      className="hero-photo"
      sizes="100vw"
      loading="eager"
      fetchPriority="high"
      width={2560}
      height={1600}
    />
  );
}
