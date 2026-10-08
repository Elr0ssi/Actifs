import { ImageResponse } from "next/og";
import { isLocale } from "@/lib/i18n";
import { getT, setRequestLocale } from "@/lib/i18n/server";

export const OG_SIZE = { width: 1200, height: 630 };

/** Image de partage (réseaux sociaux) dans la langue de la page. */
export function ogImage(lang: string) {
  if (isLocale(lang)) setRequestLocale(lang);
  const tr = getT();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 45%, #312e81 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 120, height: 120, borderRadius: 34, background: "linear-gradient(135deg,#a78bfa,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,.3)" }}>
            <div style={{ position: "absolute", left: 30, top: 34, width: 22, height: 22, borderRadius: 22, background: "rgba(255,255,255,.55)" }} />
            <div style={{ position: "absolute", left: 68, top: 34, width: 22, height: 22, borderRadius: 22, background: "rgba(255,255,255,.55)" }} />
            <div style={{ position: "absolute", left: 46, top: 66, width: 30, height: 30, borderRadius: 30, background: "white" }} />
          </div>
          <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -4 }}>Flozea</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>{tr("Agenda, courses, budget et notes : une seule appli")}</div>
        <div style={{ marginTop: 28, display: "flex", gap: 16, fontSize: 28, opacity: 0.9 }}>
          <span>📅 {tr("Agenda")}</span><span>🍽️ {tr("Repas")}</span><span>💶 {tr("Finances")}</span>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
