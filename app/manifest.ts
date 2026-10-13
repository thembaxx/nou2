import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Carpur — Beyond the price tag",
    short_name: "Carpur",
    description: "South Africa’s smarter automotive marketplace",
    lang: "en-ZA",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#090b0e",
    theme_color: "#090b0e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
