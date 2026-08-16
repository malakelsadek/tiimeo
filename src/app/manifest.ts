import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tiimeo — live countdown",
    short_name: "tiimeo",
    description: "A live countdown for what's happening now and what's next, synced from Google Calendar.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
