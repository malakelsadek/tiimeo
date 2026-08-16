import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2a78d6",
          color: "#ffffff",
          fontSize: 280,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        t
      </div>
    ),
    { width: 512, height: 512 }
  );
}
