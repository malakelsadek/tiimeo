import type { Metadata, Viewport } from "next";
import { Orbitron, VT323, Rajdhani, Space_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], weight: ["500", "700"] });
const vt323 = VT323({ variable: "--font-vt323", subsets: ["latin"], weight: ["400"] });
const rajdhani = Rajdhani({ variable: "--font-rajdhani", subsets: ["latin"], weight: ["600", "700"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"] });
const bebasNeue = Bebas_Neue({ variable: "--font-bebas-neue", subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "tiimeo",
  description: "A live countdown for what's happening now and what's next, synced from Google Calendar.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "tiimeo",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${orbitron.variable} ${vt323.variable} ${rajdhani.variable} ${spaceMono.variable} ${bebasNeue.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
} 
