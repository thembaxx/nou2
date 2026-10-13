"use client";
import type { ComponentProps } from "react";
import { useDevicePreferences } from "./device-preferences";
export function ResponsivePhoto({
  src,
  sizes = "100vw",
  loading = "lazy",
  decoding = "async",
  ...props
}: ComponentProps<"img"> & { src: string }) {
  const { tier } = useDevicePreferences();
  const match = src.match(/^\/images\/(hero|bmw|mercedes|golf|toyota)\.webp$/);
  const name = match?.[1];
  const manufacturer = src.startsWith("https://assets.cdntoyota.co.za/");
  const adaptiveSource =
    manufacturer && tier === "reduced"
      ? src.replace(".mobile.png", ".thumbnail.png")
      : manufacturer && tier === "enhanced"
        ? src.replace(".mobile.png", ".desktop.png")
        : src;
  const widths =
    tier === "reduced"
      ? [320, 640]
      : name === "hero"
        ? [320, 640, 960, 1600, 2560]
        : [320, 640, 960, 1600];
  return (
    <img
      {...props}
      src={adaptiveSource}
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
