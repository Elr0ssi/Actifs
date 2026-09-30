import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Feed {
  name: string;
  tasks: { id: string; title: string; due_date: string; due_time: string | null; status: string; description: string | null }[];
  routines: { id: string; title: string; frequency: string; days_of_week: number[] | null; created_at: string }[];
}

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const compact = (d: string) => d.replace(/-/g, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const nextDay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

/** Les lignes ICS font 75 octets au plus : on les replie avec une espace en début de ligne suivante. */
function fold(line: string) {
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch) > 73) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

/** Flux iCalendar en lecture seule (abonnement Google Agenda, Apple Calendrier, Outlook…). Le jeton dans l'URL fait office de clé. */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const token = params.token.replace(/\.ics$/, "");
  if (!/^[0-9a-f-]{36}$/i.test(token)) return new NextResponse("Not found", { status: 404 });
  const supabase = createClient();
  const { data } = await supabase.rpc("calendar_feed", { p_token: token });
  const feed = data as Feed | null;
  if (!feed) return new NextResponse("Not found", { status: 404 });

  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const L: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//All In//Agenda//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:All In · ${esc(feed.name || "Agenda")}`,
    "X-WR-TIMEZONE:Europe/Paris",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const t of feed.tasks) {
    const done = t.status === "done";
    L.push("BEGIN:VEVENT", `UID:task-${t.id}@allin`, `DTSTAMP:${stamp}`);
    if (t.due_time) {
      const hhmm = t.due_time.slice(0, 5).replace(":", "");
      const end = String((Number(hhmm.slice(0, 2)) + 1) % 24).padStart(2, "0") + hhmm.slice(2);
      L.push(`DTSTART;TZID=Europe/Paris:${compact(t.due_date)}T${hhmm}00`, `DTEND;TZID=Europe/Paris:${compact(t.due_date)}T${end}00`);
    } else {
      L.push(`DTSTART;VALUE=DATE:${compact(t.due_date)}`, `DTEND;VALUE=DATE:${compact(nextDay(t.due_date))}`, "TRANSP:TRANSPARENT");
    }
    L.push(`SUMMARY:${done ? "✓ " : ""}${esc(t.title)}`);
    if (t.description) L.push(`DESCRIPTION:${esc(t.description)}`);
    L.push("STATUS:CONFIRMED", "CATEGORIES:Tâche", "END:VEVENT");
  }

  for (const r of feed.routines) {
    const days = (r.days_of_week ?? []).filter((d) => d >= 0 && d <= 6);
    if (r.frequency === "weekly" && days.length === 0) continue;
    // Le premier jour doit correspondre à la règle : on avance jusqu'au premier jour prévu.
    let start = r.created_at.slice(0, 10);
    if (r.frequency === "weekly") for (let i = 0; i < 7 && !days.includes(new Date(`${start}T00:00:00Z`).getUTCDay()); i++) start = nextDay(start);
    L.push(
      "BEGIN:VEVENT",
      `UID:routine-${r.id}@allin`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(start)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(start))}`,
      r.frequency === "daily" ? "RRULE:FREQ=DAILY" : `RRULE:FREQ=WEEKLY;BYDAY=${days.map((d) => BYDAY[d]).join(",")}`,
      `SUMMARY:↻ ${esc(r.title)}`,
      "TRANSP:TRANSPARENT",
      "CATEGORIES:Routine",
      "END:VEVENT"
    );
  }
  L.push("END:VCALENDAR");

  return new NextResponse(L.map(fold).join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=300", "Content-Disposition": 'inline; filename="all-in.ics"' },
  });
}
