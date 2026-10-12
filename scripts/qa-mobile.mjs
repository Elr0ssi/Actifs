// Contrôles de navigation du site vitrine sur téléphone (Playwright + Chromium).
//   QA_URL=http://localhost:3100 node scripts/qa-mobile.mjs
// Prérequis : un serveur `next start` déjà lancé et Playwright installé (npm i -g playwright, ou dans le PATH de node).
// Limite : Chromium seulement (pas WebKit/Safari) — les tailles d'écran et le tactile d'un iPhone sont émulés, pas le moteur de Safari.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const BASE = process.env.QA_URL || "http://localhost:3100";
const DEVICES = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 14", width: 390, height: 844 },
  { name: "iPhone 14 Pro Max", width: 430, height: 932 },
];
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const PAGES = [
  "/", "/fonctionnalites", "/organisation", "/repas", "/finances", "/fonctionnalites/agenda", "/fonctionnalites/budget-et-finances",
  "/recettes", "/recettes/idees", "/recettes/idees/idees-tartines", "/recettes/poulet-basquaise", "/guides", "/outils", "/outils/budget-mensuel", "/calculateurs",
  "/tarifs", "/login", "/signup", "/confidentialite", "/cgu", "/mentions-legales", "/en", "/en/recettes", "/es/tarifs", "/de/guides", "/page-qui-n-existe-pas",
];

let failures = 0;
let quiet = false;
const ok = (cond, label, extra = "") => { if (!(quiet && cond)) console.log(`${cond ? "  ✔" : "  ✘"} ${label}${extra ? ` — ${extra}` : ""}`); if (!cond) failures++; };

async function newPage(browser, d, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA, ...extra });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  // Hors Vercel, le script de statistiques /_vercel/insights n'existe pas (404 attendu en local) : on l'ignore.
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|insights/.test(m.text())) errors.push(`console: ${m.text()}`); });
  page.on("requestfailed", (r) => { if (!/_vercel|insights|favicon/.test(r.url()) && !r.failure()?.errorText.includes("ERR_ABORTED")) errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`); });
  page.on("response", (r) => { if (r.status() >= 400 && !/_vercel|insights/.test(r.url())) errors.push(`http ${r.status()}: ${r.url()}`); });
  return { ctx, page, errors };
}

/** Éléments avec du texte dont l'opacité effective est < 0,5 sans aucun défilement (contenu « en attente d'une animation »). */
async function hiddenContent(page) {
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("main *, footer *")) {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      let o = 1;
      for (let p = el; p && p !== document.documentElement; p = p.parentElement) { const cs = getComputedStyle(p); o *= Number(cs.opacity); if (cs.display === "none" || cs.visibility === "hidden") { o = 1; break; } }
      if (o < 0.5) out.push(`${el.tagName.toLowerCase()}:${el.textContent.trim().slice(0, 24)}`);
      if (out.length > 3) break;
    }
    return out;
  });
}

async function overflow(page) {
  return page.evaluate(() => {
    const w = window.innerWidth;
    const doc = document.documentElement;
    const bad = [];
    if (doc.scrollWidth > w + 1) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.right > w + 1 && r.width > 0 && getComputedStyle(el).position !== "fixed") {
          let clipped = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o !== "visible") { clipped = true; break; } }
          if (!clipped) bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)} right=${Math.round(r.right)}`);
        }
        if (bad.length > 3) break;
      }
    }
    return { scrollWidth: doc.scrollWidth, innerWidth: w, bad };
  });
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });

const ONLY_LOAD = process.env.QA_ONLY === "load";
if (!ONLY_LOAD) {
console.log(`\n# 1. Pages publiques sans débordement ni erreur (${BASE}) — seuls les échecs sont listés`);
quiet = true;
for (const d of DEVICES) {
  console.log(`\n## ${d.name} ${d.width}×${d.height}`);
  const { ctx, page, errors } = await newPage(browser, d);
  for (const path of PAGES) {
    errors.length = 0;
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" }).catch((e) => ({ status: () => 0, err: e }));
    const status = res.status();
    const expected404 = path === "/page-qui-n-existe-pas";
    const o = await overflow(page);
    const h1 = await page.locator("h1").count();
    const hid = await hiddenContent(page);
    if (hid.length) errors.push(`contenu masqué au chargement: ${hid.join(" | ")}`);
    const text = `${status}${o.bad.length || o.scrollWidth > o.innerWidth + 1 ? ` débordement ${o.scrollWidth}>${o.innerWidth} ${o.bad.join(" | ")}` : ""}${errors.length ? ` erreurs: ${errors.slice(0, 2).join(" ; ")}` : ""}`;
    const before = failures;
    ok((expected404 ? status === 404 : status === 200) && o.scrollWidth <= o.innerWidth + 1 && errors.filter((e) => !(expected404 && /http 404/.test(e))).length === 0 && (expected404 || h1 === 1), `${path}`, status === 200 && !errors.length && h1 === 1 ? "" : `${text} h1=${h1}`);
  }
  console.log(`  ${PAGES.length} pages contrôlées`);
  await ctx.close();
}
quiet = false;

console.log("\n# 2. Menu mobile (iPhone 14)");
{
  const { ctx, page } = await newPage(browser, DEVICES[1]);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const burger = page.getByRole("button", { name: /menu/i }).first();
  ok(await burger.isVisible(), "le bouton du menu est visible");
  const box = await burger.boundingBox();
  ok(box.width >= 44 && box.height >= 44, "zone tactile du bouton ≥ 44 px", `${Math.round(box.width)}×${Math.round(box.height)}`);
  ok((await page.locator("#mobile-menu").count()) === 0, "menu absent du DOM tant qu'il est fermé");

  await burger.tap();
  const dialog = page.locator("#mobile-menu");
  await dialog.waitFor({ state: "visible" });
  ok(await dialog.isVisible(), "ouverture au toucher");
  ok((await page.evaluate(() => getComputedStyle(document.documentElement).overflow)) === "hidden", "défilement de la page bloqué pendant l'ouverture");
  ok((await burger.getAttribute("aria-expanded")) === "true", "aria-expanded=true");
  ok((await dialog.getAttribute("aria-modal")) === "true", "role=dialog aria-modal");
  const focusInside = await page.evaluate(() => !!document.activeElement?.closest("#mobile-menu"));
  ok(focusInside, "le focus entre dans le menu");
  ok((await dialog.locator("nav").count()) === 1, "un seul bloc de navigation visible (menu principal)");

  await dialog.getByRole("button", { name: /Fonctionnalités|Features/ }).click();
  await page.waitForTimeout(300);
  ok((await dialog.locator("nav").count()) === 1 && (await dialog.getByText(/Agenda/).count()) > 0, "sous-menu Fonctionnalités : il remplace le menu principal (jamais empilé)");
  ok((await dialog.getByRole("button", { name: /Recettes et guides|Recipes and guides/ }).count()) === 0, "le menu principal n'est plus affiché en même temps");
  const linksFeat = await dialog.locator("nav a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  ok(new Set(linksFeat).size === linksFeat.length, "aucun lien en double dans le sous-menu", `${linksFeat.length} liens`);
  const small = await dialog.locator("a, button").evaluateAll((els) => els.filter((e) => e.offsetParent && e.getBoundingClientRect().height < 40).map((e) => (e.textContent || "").trim().slice(0, 20)));
  ok(small.length === 0, "toutes les cibles tactiles du menu font ≥ 40 px de haut", small.join(","));

  await dialog.getByRole("button", { name: "Menu", exact: true }).click();
  await page.waitForTimeout(250);
  ok((await dialog.getByRole("button", { name: /Fonctionnalités/ }).count()) === 1, "bouton Retour : retour au menu principal");

  await dialog.getByRole("button", { name: /Recettes et guides/ }).click();
  await page.waitForTimeout(250);
  const res = await dialog.locator("nav a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  ok(res.some((h) => h.includes("guides")) && res.some((h) => h.includes("outils")) && res.some((h) => h.includes("recettes")), "sous-menu Recettes et guides : recettes, idées, guides, outils", res.join(" "));

  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  ok((await page.locator("#mobile-menu").count()) === 0, "Échap ferme le menu");
  ok((await page.evaluate(() => getComputedStyle(document.documentElement).overflow)) !== "hidden", "défilement rendu après fermeture");
  ok(await page.evaluate(() => document.activeElement?.getAttribute("aria-controls") === "mobile-menu"), "le focus revient sur le bouton");

  // navigation depuis le menu
  await burger.tap();
  await page.locator("#mobile-menu").getByRole("button", { name: /Fonctionnalités/ }).click();
  await page.locator("#mobile-menu nav a[href*='fonctionnalites/']").first().click();
  await page.waitForURL(/fonctionnalites\//);
  await page.waitForTimeout(300);
  ok((await page.locator("#mobile-menu").count()) === 0, "le menu est fermé après un clic sur un lien");
  ok((await page.evaluate(() => getComputedStyle(document.documentElement).overflow)) !== "hidden", "pas de défilement bloqué après la navigation");
  await page.goBack();
  await page.waitForTimeout(400);
  ok((await page.locator("#mobile-menu").count()) === 0, "le menu ne se rouvre pas au retour arrière");
  await burger.tap();
  ok((await page.locator("#mobile-menu").getByRole("button", { name: /Fonctionnalités/ }).count()) === 1, "à la réouverture, on repart du menu principal");

  // lien de connexion / inscription
  ok((await page.locator("#mobile-menu a[href='/login']").count()) === 1 && (await page.locator("#mobile-menu a[href='/signup']").count()) === 1, "Connexion et Créer mon espace présents dans le menu");
  await page.setViewportSize({ width: 900, height: 700 });
  await page.waitForTimeout(300);
  ok((await page.locator("#mobile-menu").count()) === 0, "le menu se ferme si l'écran devient large");
  await ctx.close();
}

console.log("\n# 2b. Menu utilisable rapidement sur un téléphone lent (iPhone 14, CPU ×6, réseau 4G)");
{
  const { ctx, page } = await newPage(browser, DEVICES[1]);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 100, downloadThroughput: (4 * 1024 * 1024) / 8, uploadThroughput: (2 * 1024 * 1024) / 8 });
  const t0 = Date.now();
  await page.goto(BASE + "/", { waitUntil: "commit" });
  let opened = -1;
  while (Date.now() - t0 < 20000) {
    const b = page.getByRole("button", { name: /Ouvrir le menu/ });
    if (await b.count()) { await b.first().tap({ timeout: 1000 }).catch(() => {}); if (await page.locator("#mobile-menu").count()) { opened = Date.now() - t0; break; } }
    await page.waitForTimeout(150);
  }
  console.log(`  le menu s'ouvre ${opened < 0 ? "jamais (20 s)" : `après ${opened} ms`}`);
  ok(opened > 0 && opened < 6000, "le menu répond en moins de 6 s même avec CPU ×6");
  await ctx.close();
}

console.log("\n# 3. Menu au clavier (desktop 1280)");
{
  const { ctx, page } = await newPage(browser, { width: 1280, height: 800 }, { isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  ok(!(await page.getByRole("button", { name: /Ouvrir le menu/ }).isVisible()), "pas de bouton burger sur grand écran");
  const nav = page.getByRole("navigation", { name: "Navigation principale" }).first();
  ok(await nav.isVisible(), "navigation de bureau visible");
  const trigger = nav.getByRole("link", { name: /Agenda/ }).first();
  await trigger.hover();
  await page.waitForTimeout(250);
  ok(await page.locator("header a[href*='fonctionnalites/']").first().isVisible(), "survol : le sous-menu s'ouvre");
  await page.mouse.move(600, 500);
  await page.waitForTimeout(250);
  ok(!(await page.locator("header a[href*='fonctionnalites/']").first().isVisible()), "le sous-menu se referme quand la souris part");
  await trigger.focus();
  await page.waitForTimeout(250);
  ok(await page.locator("header a[href*='fonctionnalites/']").first().isVisible(), "focus clavier : le sous-menu s'ouvre");
  await ctx.close();
}

}
console.log("\n# 3b. Accueil grand écran : section figée et frise (desktop 1280)");
{
  const { ctx, page } = await newPage(browser, { width: 1280, height: 800 }, { isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const tabs = page.locator("#fonctionnalites [role=tablist] button");
  await tabs.first().waitFor({ state: "attached", timeout: 5000 }).catch(() => {});
  ok((await tabs.count()) === 3, "section figée : 3 onglets Agenda / Repas / Finances");
  const top = await page.evaluate(() => document.querySelector("#fonctionnalites").getBoundingClientRect().top + scrollY);
  const states = [];
  for (const f of [0.1, 0.45, 0.8]) {
    const h = await page.evaluate(() => document.querySelector("#fonctionnalites > div.hidden").offsetHeight - innerHeight);
    await page.evaluate(([t, h, f]) => window.scrollTo(0, t + h * f), [top, h, f]);
    await page.waitForTimeout(500);
    states.push(await tabs.evaluateAll((bs) => bs.findIndex((b) => b.getAttribute("aria-selected") === "true")));
  }
  ok(states[0] === 0 && states[2] === 2, "le défilement change l'onglet actif", states.join("→"));
  await page.evaluate(() => document.querySelector("[aria-labelledby=quotidien]").scrollIntoView());
  await page.waitForTimeout(800);
  ok((await page.locator("[aria-labelledby=quotidien] svg path[stroke-dasharray=\"2 12\"]").count()) > 0, "frise : le chemin sinueux est présent");
  await ctx.close();
  const m = await newPage(browser, DEVICES[1]);
  await m.page.goto(BASE + "/", { waitUntil: "networkidle" });
  ok((await m.page.locator("[aria-labelledby=quotidien] svg path[stroke-dasharray=\"2 12\"]").count()) === 0, "mobile : la version bureau de la frise n'est pas construite");
  ok((await m.page.locator("#fonctionnalites [role=tablist]").count()) === 0, "mobile : la section figée n'est pas construite");
  await m.ctx.close();
}

console.log("\n# 4. Chargement initial de l'accueil (iPhone 14, CPU ×4, réseau 4G rapide)");
{
  const { ctx, page } = await newPage(browser, DEVICES[1]);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 70, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (4 * 1024 * 1024) / 8 });
  await page.addInitScript(() => {
    window.__m = { lcp: 0, cls: 0, fcp: 0, h1: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") window.__m.fcp = e.startTime; }).observe({ type: "paint", buffered: true });
  });
  await page.goto(BASE + "/", { waitUntil: "load" });
  const h1Opacity = await page.evaluate(() => { const h = document.querySelector("h1"); return h ? getComputedStyle(h).opacity + "/" + getComputedStyle(h.parentElement).opacity : "none"; });
  await page.waitForTimeout(3000);
  const m = await page.evaluate(() => window.__m);
  console.log(`  FCP ${Math.round(m.fcp)} ms · LCP ${Math.round(m.lcp)} ms · CLS ${m.cls.toFixed(3)} · opacité du titre à l'événement load: ${h1Opacity}`);
  ok(h1Opacity.startsWith("1/1"), "le titre est visible dès le chargement (jamais masqué en attendant React)");
  ok(m.cls < 0.1, "CLS < 0.1");
  await ctx.close();
}

await browser.close();
console.log(`\n${failures ? `✘ ${failures} contrôle(s) en échec` : "✔ tous les contrôles passent"}`);
process.exit(failures ? 1 : 0);
