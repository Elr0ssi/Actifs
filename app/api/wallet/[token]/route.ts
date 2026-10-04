import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guessCategory, parisNow, parseAmount } from "@/lib/wallet";

export const dynamic = "force-dynamic";

const pick = (o: Record<string, unknown>, keys: string[]) => {
  for (const k of Object.keys(o)) if (keys.includes(k.toLowerCase().replace(/[\s_-]/g, ""))) return o[k];
  return undefined;
};

async function readPayload(req: Request): Promise<Record<string, unknown>> {
  const url = new URL(req.url);
  const out: Record<string, unknown> = Object.fromEntries(url.searchParams.entries());
  if (req.method === "POST") {
    const type = req.headers.get("content-type") ?? "";
    try {
      if (type.includes("json")) Object.assign(out, await req.json());
      else if (type.includes("form")) Object.assign(out, Object.fromEntries((await req.formData()).entries()));
      else {
        const text = await req.text();
        try { Object.assign(out, JSON.parse(text)); } catch { if (text.trim()) out.raw = text.trim(); }
      }
    } catch {
      /* corps illisible : on garde les paramètres d'URL */
    }
  }
  return out;
}

/** Reçoit un paiement (Raccourci iPhone « Transaction » ou test depuis un navigateur) et l'enregistre dans les finances du foyer. */
async function handle(req: Request, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const body = await readPayload(req);

  // « merchant » (Commerçant) prime ; « name » (Nom) sert de repli si le commerçant est vide.
  const asText = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
  const merchantRaw =
    asText(pick(body, ["merchant", "commercant", "commerçant"])) ?? asText(pick(body, ["name", "nom", "shop", "label", "libelle"]));
  const amountRaw = pick(body, ["amount", "montant", "price", "prix", "total"]) ?? body.raw;
  const cardRaw = pick(body, ["card", "carte", "cardorpass", "carteoubillet", "pass"]);
  const amount = parseAmount(amountRaw);
  if (amount === null || amount === 0) return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });

  const merchant = typeof merchantRaw === "string" && merchantRaw.trim() ? merchantRaw.trim() : "Paiement carte";
  const now = parisNow();
  const dateRaw = pick(body, ["date"]);
  const date = typeof dateRaw === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateRaw) ? dateRaw.slice(0, 10) : now.date;
  const timeRaw = pick(body, ["time", "heure"]);
  const time = typeof timeRaw === "string" && /^\d{2}:\d{2}/.test(timeRaw) ? timeRaw.slice(0, 5) : now.time.slice(0, 5);
  const explicitCategory = pick(body, ["category", "categorie", "catégorie"]);

  const supabase = createClient();
  const { data, error } = await supabase.rpc("ingest_wallet_txn", {
    p_token: token,
    p_merchant: merchant,
    p_amount: amount,
    p_date: date,
    p_time: time,
    p_card: typeof cardRaw === "string" ? cardRaw : null,
    p_category: typeof explicitCategory === "string" && explicitCategory ? explicitCategory : guessCategory(merchant),
  });
  if (error) return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  const result = data as { ok: boolean; error?: string };
  if (!result.ok) return NextResponse.json(result, { status: result.error === "invalid_token" ? 404 : 400 });
  return NextResponse.json(result);
}

export const POST = handle;
export const GET = handle;
