import type { SupabaseClient } from "@supabase/supabase-js";
import { conflictTarget, type Op } from "~/core/outbox";

export type FlushResult =
  | { status: "ok" }
  | { status: "offline" }
  | { status: "rejected"; message: string };

interface PgResult { error: { message: string; code?: string } | null; status?: number }

/** Erreur réseau / session expirée = on réessaiera plus tard ; toute autre erreur = refus définitif du serveur (RLS, contrainte…). */
export function classify(res: PgResult): FlushResult {
  if (!res.error) return { status: "ok" };
  const msg = res.error.message ?? "";
  if (res.status === 0 || /network|fetch|timed? ?out|offline|failed to/i.test(msg)) return { status: "offline" };
  if (res.status === 401 || res.status === 503 || res.status === 429 || res.error.code === "PGRST301" || /jwt/i.test(msg)) return { status: "offline" };
  return { status: "rejected", message: msg };
}

/** Envoie UNE opération au serveur. Les opérations sont idempotentes (voir core/outbox.ts). */
export async function sendOp(sb: SupabaseClient, op: Op): Promise<FlushResult> {
  try {
    if (op.kind === "upsert") {
      const res = await sb.from(op.table).upsert(op.row, { onConflict: op.onConflict ?? conflictTarget(op.table) ?? "id" });
      return classify(res as unknown as PgResult);
    }
    if (op.kind === "patch") {
      const res = await sb.from(op.table).update(op.patch).match(op.match);
      return classify(res as unknown as PgResult);
    }
    const res = await sb.from(op.table).delete().match(op.match);
    return classify(res as unknown as PgResult);
  } catch {
    return { status: "offline" };
  }
}
