import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#a78bfa,#6d28d9)", position: "relative" }}>
        <div style={{ position: "absolute", left: 46, top: 52, width: 38, height: 38, borderRadius: 38, background: "rgba(255,255,255,.55)" }} />
        <div style={{ position: "absolute", left: 96, top: 52, width: 38, height: 38, borderRadius: 38, background: "rgba(255,255,255,.55)" }} />
        <div style={{ position: "absolute", left: 66, top: 96, width: 48, height: 48, borderRadius: 48, background: "white" }} />
      </div>
    ),
    size
  );
}
