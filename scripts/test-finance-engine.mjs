// Tests du moteur financier (lib/finance-engine.ts) sans dépendance de test : `node scripts/test-finance-engine.mjs`
// Le TypeScript est transpilé à la volée avec le compilateur du projet, l'alias `@/` pointe sur la racine.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
require.extensions[".ts"] = (module, filename) => {
  const out = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, esModuleInterop: true } });
  module._compile(out.outputText, filename);
};
const Module = require("node:module");
const orig = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(root, request.slice(2));
  return orig.call(this, request, ...rest);
};
const E = require(path.join(root, "lib/finance-engine.ts"));

const op = (o) => ({ id: "x", table: "charge", kind: "variable", name: "Budget", amount: 70, category: "Alimentation / Courses", frequency: "once", interval: 1, weekdays: [], monthDays: [], start: "2026-06-05", end: null, skipped: [], weekendRule: "none", moved: {}, active: true, note: null, account: null, ...o });
const pay = (o) => ({ ...op({ kind: "daily", table: "charge", name: "Carrefour", ...o }), txn: { id: o.id ?? "t", time: null, card: null, validates: o.validates } });
const sum = (occ) => occ.reduce((s, o) => s + o.signed, 0);
let n = 0;
const t = (name, fn) => { fn(); n++; console.log("  ✔", name); };

t("parseValidation : aller-retour et rejet des sources étrangères", () => {
  assert.deepEqual(E.parseValidation(E.validationSource("abc-123", "2026-06-05")), { opId: "abc-123", date: "2026-06-05" });
  assert.equal(E.parseValidation("wallet"), null);
  assert.equal(E.parseValidation("valide:abc:pas-une-date"), null);
});

t("une occurrence validée est remplacée par le montant réel (pas de double comptage)", () => {
  const planned = op({ id: "p1" });
  const real = pay({ id: "t1", amount: 55, start: "2026-06-05", validates: { opId: "p1", date: "2026-06-05" } });
  assert.equal(sum(E.expand([planned], "2026-06-01", "2026-06-30")), -70);
  assert.equal(sum(E.expand([planned, real], "2026-06-01", "2026-06-30")), -55);
});

t("un paiement validé ne consomme pas aussi les AUTRES lignes prévues de la catégorie", () => {
  const fri = op({ id: "p1", start: "2026-06-05" });
  const sat = op({ id: "p2", start: "2026-06-06" });
  const validated = pay({ id: "t1", amount: 70, start: "2026-06-05", validates: { opId: "p1", date: "2026-06-05" } });
  assert.equal(sum(E.expand([fri, sat, validated], "2026-06-01", "2026-06-30")), -140); // vendredi réel 70 + samedi prévu 70
});

t("un paiement par carte libre consomme l'enveloppe de sa catégorie (une seule fois)", () => {
  const fri = op({ id: "p1", start: "2026-06-05" });
  const sat = op({ id: "p2", start: "2026-06-06" });
  const card = pay({ id: "t2", amount: 70, start: "2026-06-05" });
  assert.equal(sum(E.expand([fri, sat, card], "2026-06-01", "2026-06-30")), -140); // 70 payé + 70 encore prévu
});

t("getEnvelopes : prévu et réel comparés jusqu'à une date", () => {
  const ops = [op({ id: "p1", start: "2026-06-05" }), op({ id: "p2", start: "2026-06-20" }), pay({ id: "t1", amount: 40, start: "2026-06-06" }), pay({ id: "t2", amount: 90, start: "2026-06-25" })];
  const all = E.getEnvelopes(ops, 2026, 5);
  assert.deepEqual([all[0].planned, all[0].real], [140, 130]);
  const upTo = E.getEnvelopes(ops, 2026, 5, "2026-06-10");
  assert.deepEqual([upTo[0].planned, upTo[0].real], [70, 40]);
});

t("getBudgetLines : à valider / validée / à venir", () => {
  const ops = [op({ id: "p1", frequency: "weekly", weekdays: [5], start: "2026-06-05", end: "2026-06-30" }), pay({ id: "t1", amount: 60, start: "2026-06-05", validates: { opId: "p1", date: "2026-06-05" } })];
  const lines = E.getBudgetLines(ops, "2026-06-01", "2026-06-30", "2026-06-13");
  assert.deepEqual(lines.map((l) => [l.date, l.status]), [["2026-06-05", "validated"], ["2026-06-12", "due"], ["2026-06-19", "upcoming"], ["2026-06-26", "upcoming"]]);
  assert.equal(lines[0].actual, 60);
});

t("une dépense payée depuis l'épargne ne touche pas le compte courant mais l'épargne", () => {
  const anchor = { balance: 1000, date: "2026-06-01" };
  const fromSavings = op({ id: "e1", kind: "variable", amount: 200, start: "2026-06-10", account: "Épargne" });
  const fromCourant = op({ id: "e2", kind: "variable", amount: 50, start: "2026-06-10" });
  assert.equal(E.getBalanceAtDate([fromSavings, fromCourant], anchor, "2026-06-30"), 950);
  assert.equal(E.getSavingsAt([fromSavings, fromCourant], { date: "2026-06-01", balance: 3000 }, "2026-06-30"), 2800);
  const save = op({ id: "s1", kind: "savings", category: "Livret A", amount: 100, start: "2026-06-15" });
  assert.equal(E.getSavingsAt([save], { date: "2026-06-01", balance: 3000 }, "2026-06-30"), 3100);
  assert.equal(E.getBalanceAtDate([save], anchor, "2026-06-30"), 900);
  assert.equal(E.getSavingsAt([], null, "2026-06-30"), null);
});

t("une ligne validée ou entièrement couverte disparaît des occurrences (aucune ligne à 0 €)", () => {
  const planned = op({ id: "p1" });
  const real = pay({ id: "t1", amount: 55, start: "2026-06-05", validates: { opId: "p1", date: "2026-06-05" } });
  const occ = E.expand([planned, real], "2026-06-01", "2026-06-30");
  assert.deepEqual(occ.map((o) => o.op.id), ["t1"]);
  const lines = E.getBudgetLines([planned, real], "2026-06-01", "2026-06-30", "2026-06-13");
  assert.equal(lines[0].status, "validated");
  const covered = E.getBudgetLines([planned, pay({ id: "t3", amount: 80, start: "2026-06-05" })], "2026-06-01", "2026-06-30", "2026-06-13");
  assert.equal(covered[0].covered, 70);
});

console.log(`\n${n} tests du moteur financier : OK`);
