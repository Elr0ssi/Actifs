import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { classify, sendOp } from "~/data/flush";
import { fetchAll } from "~/data/fetch";
import { applyOps } from "~/core/outbox";
import { setRoutineLog, addTask } from "~/core/mutations";
import { ctx, makeData } from "./fixtures";
import { sel } from "~/core/model";

/** Faux client Supabase : enregistre les requêtes et renvoie des tableaux vides. */
function fakeClient(opts: { profile?: Record<string, unknown> | null } = {}) {
  const calls: { table: string; select?: string; filters: [string, unknown][] }[] = [];
  const from = (table: string) => {
    const rec = { table, select: undefined as string | undefined, filters: [] as [string, unknown][] };
    calls.push(rec);
    const result = () => ({ data: table === "profiles" ? null : [], error: null, count: 0 });
    const q: Record<string, unknown> = {};
    const chain = (name: string, fn?: (...a: unknown[]) => void) => (...a: unknown[]) => { fn?.(...a); return q; };
    q.select = chain("select", (cols) => { rec.select = String(cols); });
    for (const m of ["eq", "neq", "gte", "lte", "or", "order", "limit", "range", "not"]) q[m] = chain(m, (...a) => { if (m === "eq") rec.filters.push([String(a[0]), a[1]]); });
    q.maybeSingle = () => Promise.resolve({ data: opts.profile ?? null, error: null });
    q.then = (res: (v: unknown) => unknown) => Promise.resolve(result()).then(res);
    return q;
  };
  return { client: { from } as never, calls };
}

describe("lecture serveur : isolation et secrets", () => {
  it("toutes les requêtes de données sont filtrées par le foyer de l'utilisateur", async () => {
    const { client, calls } = fakeClient({ profile: { id: "u-1", household_id: "h-1", display_name: "A" } });
    await fetchAll(client, "u-1", "2026-06-15");
    const dataCalls = calls.filter((c) => c.table !== "profiles" && c.table !== "routine_logs");
    expect(dataCalls.length).toBeGreaterThan(8);
    for (const c of dataCalls) {
      const key = c.table === "households" ? "id" : "household_id";
      expect(c.filters).toContainEqual([key, "h-1"]);
    }
  });

  it("ne lit jamais les jetons de flux (ical_token, wallet_token)", async () => {
    const { client, calls } = fakeClient({ profile: { id: "u-1", household_id: "h-1" } });
    await fetchAll(client, "u-1", "2026-06-15");
    const h = calls.find((c) => c.table === "households");
    expect(h?.select).toBeDefined();
    expect(h?.select).not.toMatch(/token|\*/);
  });

  it("sans foyer : aucune requête de données", async () => {
    const { client, calls } = fakeClient({ profile: { id: "u-1", household_id: null } });
    const d = await fetchAll(client, "u-1", "2026-06-15");
    expect(calls.map((c) => c.table)).toEqual(["profiles"]);
    expect(d.tables.tasks).toEqual([]);
  });
});

describe("classification des erreurs d'écriture", () => {
  it("réseau / session expirée → on réessaiera ; contrainte ou RLS → refus définitif", () => {
    expect(classify({ error: null }).status).toBe("ok");
    expect(classify({ error: { message: "TypeError: Network request failed" }, status: 0 }).status).toBe("offline");
    expect(classify({ error: { message: "JWT expired", code: "PGRST301" }, status: 401 }).status).toBe("offline");
    expect(classify({ error: { message: "new row violates row-level security policy", code: "42501" }, status: 403 })).toEqual({ status: "rejected", message: "new row violates row-level security policy" });
  });

  it("une exception réseau pendant l'envoi laisse l'écriture en file", async () => {
    const boom = { from: () => { throw new TypeError("Network request failed"); } } as never;
    const [op] = addTask(ctx(), { title: "x" });
    expect((await sendOp(boom, op)).status).toBe("offline");
  });
});

describe("hors-ligne : pas de doublon au rejeu", () => {
  it("rejouer la file deux fois donne le même état", () => {
    const c = ctx();
    const ops = [...addTask(c, { title: "Appeler" }), ...setRoutineLog(c, "r1", "2026-06-15", true)];
    const once = applyOps(makeData(), ops);
    const twice = applyOps(once, ops);
    expect(sel.tasks(twice)).toHaveLength(1);
    expect(sel.logs(twice)).toHaveLength(1);
  });
});

describe("secrets dans le code mobile", () => {
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (f === "node_modules" || f === "__tests__" || f === "dist" || f === "ios" || f === ".expo") return [];
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|js|json|swift)$/.test(f) && f !== "package-lock.json" ? [p] : [];
  });
  const files = walk(join(__dirname, ".."));
  const code = (f: string) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

  it("aucune clé service_role / jeton JWT en dur", () => {
    expect(files.length).toBeGreaterThan(20);
    for (const f of files) {
      const text = code(f);
      expect(text).not.toMatch(/service_role|SERVICE_ROLE/);
      expect(text).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./); // forme d'un JWT
    }
  });

  it("les jetons de flux du foyer ne sont jamais lus par l'app", () => {
    for (const f of files.filter((x) => x.includes("/src/") || x.includes("/app/"))) {
      expect(code(f)).not.toMatch(/ical_token|wallet_token/);
    }
  });
});
