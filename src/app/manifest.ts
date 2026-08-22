import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aabriha Mart",
    short_name: "Aabriha Mart",
    description: "Clothing, shoes, bags & electronics — Aabriha Mart",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#1c76ad",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
