import type { Metadata } from "next";
import Link from "next/link";
import { LogoWordmark } from "@/components/logo";
import { JsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { Bubble, Float, InView } from "@/components/marketing/fx";
import { Ambience, CtaBanner } from "@/components/marketing/sections";
import { SITE_NAME, SITE_URL } from "@/lib/marketing/site";
import { cx } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Flozea: planner, meals and budget in one simple app",
  description: "Flozea puts your calendar, to-dos and habits, recipes and weekly meal plan, grocery lists, budget and notes in one place, alone or with a partner. Free to start. The app is currently in French.",
  alternates: { canonical: "/en", languages: { fr: "/", en: "/en", "x-default": "/" } },
  openGraph: { title: "Flozea: planner, meals and budget in one simple app", description: "Calendar, tasks, meals, groceries, budget and notes in one place. Free to start.", url: `${SITE_URL}/en`, type: "website", locale: "en_US", alternateLocale: ["fr_FR"], siteName: SITE_NAME },
  twitter: { card: "summary_large_image", title: "Flozea: planner, meals and budget in one simple app", description: "Calendar, tasks, meals, groceries, budget and notes in one place. Free to start." },
};

const MODULES = [
  {
    name: "Flozea Agenda",
    icon: "📅",
    tag: "Plan your time",
    gradient: "from-brand-500 to-violet-700",
    points: ["Hourly calendar: drag to create, move and resize tasks", "Tasks, projects and habits you can tick off", "Notebook-style notes with pages and sub-pages", "Sync to Google Calendar or iPhone"],
  },
  {
    name: "Flozea Repas",
    icon: "🍽️",
    tag: "Meals & groceries",
    gradient: "from-amber-500 to-orange-700",
    points: ["90+ simple recipes, scaled to the number of people", "Weekly meal plan with lunch and dinner", "Grocery list with merged quantities rounded to pack sizes", "Shared list with your partner or household"],
  },
  {
    name: "Flozea Finances",
    icon: "💶",
    tag: "Money, clearly",
    gradient: "from-fuchsia-500 to-brand-700",
    points: ["Financial calendar with a daily \"left to spend\"", "Salary shifted off weekends automatically", "Apple Pay payments added automatically", "Bank connection and spending analysis: coming soon"],
  },
];

const FAQ = [
  { q: "Is Flozea available in English?", a: "The website is available in English, but the app itself is currently in French only. An English version of the app is something we would like to add." },
  { q: "How much does Flozea cost?", a: "The free plan includes every feature: calendar, tasks, recipes, groceries, budget and notes. A 3 € per month plan to connect your bank account and analyse your spending is planned but not available yet." },
  { q: "Can I use it with my partner?", a: "Yes. Invite your partner or housemates with a code and share the calendar, meal plan, grocery lists and budget." },
  { q: "Where is my data stored?", a: "Your data is stored with our hosting providers (Supabase and Vercel). We do not sell it and we show no ads. See the privacy policy (in French) for details." },
];

export default function EnglishPage() {
  return (
    <div className="relative overflow-hidden" lang="en">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebPage", name: "Flozea", url: `${SITE_URL}/en`, inLanguage: "en" },
          { "@context": "https://schema.org", "@type": "SoftwareApplication", name: SITE_NAME, url: `${SITE_URL}/en`, applicationCategory: "LifestyleApplication", operatingSystem: "Web", inLanguage: "fr-FR", description: "Calendar, tasks, meals, groceries, budget and notes in one place. The app interface is in French.", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } },
          faqJsonLd(FAQ),
        ]}
      />
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/en"><LogoWordmark className="text-lg" /></Link>
          <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium text-stone-600 sm:flex">
            <a href="#modules" className="hover:text-stone-900">Features</a>
            <a href="#pricing" className="hover:text-stone-900">Pricing</a>
            <a href="#faq" className="hover:text-stone-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/" hrefLang="fr" lang="fr" className="text-sm font-semibold text-stone-700 hover:text-stone-900">Français</Link>
            <Link href="/signup" className="btn-primary">Create my free space</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <Ambience tone="violet" emojis={["📅", "🍽️", "💶"]} />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">Free to start · alone or together</span>
              <h1 className="mt-6">
                <span className="block bg-gradient-to-r from-brand-500 via-violet-600 to-fuchsia-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl lg:text-[7.5rem] lg:leading-none">Flozea</span>
                <span className="mt-5 block text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl lg:leading-tight">Calendar, meals, budget and notes: <span className="text-brand-600">one simple app</span></span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">Plan your week, turn your meal plan into a grocery list, and see what you can spend today. Flozea replaces Notion, spreadsheets, recipe apps and your calendar.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup" className="btn-primary px-6 py-3 text-base">Create my free space</Link>
                <a href="#modules" className="px-2 py-3 text-base font-semibold text-stone-700 underline-offset-4 hover:text-brand-700 hover:underline">See what it does →</a>
              </div>
              <p className="mt-3 text-xs text-stone-500">No credit card. Note: the app interface is currently in French.</p>
            </div>
            <div className="relative mx-auto w-full max-w-lg pb-6 pt-8" aria-hidden>
              <div className="card p-4 shadow-lift">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-800"><span>Calendar · week</span><span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">Today</span></div>
                <div className="mt-3 grid grid-cols-5 gap-1.5 text-[10px] text-stone-500">
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => <span key={d} className="text-center">{d}</span>)}
                  <div className="space-y-1"><span className="block rounded-md bg-brand-500/15 px-1 py-2 text-brand-800">Meeting</span><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">↻ Gym</span></div>
                  <div className="space-y-1"><span className="block rounded-md bg-amber-500/15 px-1 py-4 text-amber-800">Client call</span></div>
                  <div className="space-y-1"><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">↻ Reading</span><span className="block rounded-md bg-sky-500/15 px-1 py-3 text-sky-800">Dentist</span></div>
                  <div className="space-y-1"><span className="block rounded-md bg-brand-500/15 px-1 py-2 text-brand-800">Quote</span></div>
                  <div className="space-y-1"><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">↻ Gym</span><span className="block rounded-md bg-rose-500/15 px-1 py-2 text-rose-700">+ €1,845</span></div>
                </div>
              </div>
              <div className="card -mt-3 ml-8 p-4 shadow-lift">
                <p className="text-xs font-semibold text-stone-800">Meals this week</p>
                <div className="mt-2 flex gap-2">
                  {[["Mon", "🍗", "Roast chicken"], ["Tue", "🍝", "Tomato pasta"], ["Wed", "🌶️", "Veggie chili"]].map(([d, e, n]) => (
                    <div key={d} className="flex-1 rounded-xl border border-line p-2"><p className="text-[10px] font-bold text-stone-700">{d}</p><p className="my-1 text-center text-2xl">{e}</p><p className="truncate text-[10px] text-stone-600">{n}</p></div>
                  ))}
                </div>
              </div>
              <div className="card -mt-3 mr-8 p-4 shadow-lift">
                <p className="text-xs text-stone-500">Left to spend until next payday</p>
                <p className="text-2xl font-bold text-stone-900">€642</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" /></div>
              </div>
              <Float delay={0} duration={7} amp={12} rot={2} className="absolute -left-4 top-0 sm:-left-10"><Bubble icon="🍝" title="Pasta tonight" sub="2 people · 25 min" tone="amber" /></Float>
              <Float delay={1.4} duration={8} amp={14} rot={-2} className="absolute -right-2 top-16 sm:-right-8"><Bubble icon="💶" title="+ €1,845" sub="salary received" tone="green" /></Float>
              <Float delay={0.7} duration={6.5} amp={10} rot={3} className="absolute -left-2 bottom-4 sm:-left-8"><Bubble icon="🔥" title="12 days" sub="habit streak" tone="rose" /></Float>
            </div>
          </div>
        </section>

        <section id="modules" className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="modules-title">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="modules-title" className="text-3xl font-bold tracking-tight sm:text-4xl">Three spaces, one logic</h2>
            <p className="mt-3 text-stone-600">What you plan in one place updates the others: meals feed groceries, groceries weigh on your budget, and it all shows up in your calendar.</p>
          </div>
          <InView>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {MODULES.map((m, i) => (
                <article key={m.name} className="fx-in overflow-hidden rounded-[2rem] border border-line bg-surface" style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}>
                  <div className={cx("bg-gradient-to-br p-6 text-white", m.gradient)}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">{m.tag}</p>
                    <h3 className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight"><span>{m.icon}</span>{m.name}</h3>
                  </div>
                  <ul className="space-y-3 p-6">
                    {m.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-stone-700"><span className="mt-0.5 text-emerald-600">✓</span>{p}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </InView>
        </section>

        <section id="pricing" className="relative overflow-hidden bg-stone-50/80 py-20" aria-labelledby="pricing-title">
          <div className="mx-auto max-w-4xl px-6">
            <h2 id="pricing-title" className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-brand-200 bg-gradient-to-br from-brand-50 to-surface p-8">
                <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Free</p>
                <p className="mt-3 flex items-end gap-2"><span className="text-5xl font-bold text-stone-900">€0</span><span className="pb-1.5 text-sm text-stone-500">forever</span></p>
                <p className="mt-2 text-sm text-stone-600">Every feature, no limits: calendar, tasks, habits, recipes, groceries, budget, notes, sharing.</p>
                <Link href="/signup" className="btn-primary mt-6 block w-full py-3 text-center">Create my free space</Link>
              </div>
              <div className="rounded-[2rem] bg-gradient-to-br from-stone-900 via-indigo-950 to-violet-900 p-8 text-white">
                <div className="flex items-center justify-between"><p className="text-sm font-bold uppercase tracking-widest text-violet-200">Bank connection</p><span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase">Coming soon</span></div>
                <p className="mt-3 flex items-end gap-2"><span className="text-5xl font-bold">€3</span><span className="pb-1.5 text-sm text-violet-200">per month</span></p>
                <p className="mt-2 text-sm text-violet-100">Connect your bank account live and get an analysis of your spending.</p>
                <span className="mt-6 block w-full cursor-not-allowed rounded-xl bg-white/15 py-3 text-center text-sm font-semibold text-white/80">Not available yet</span>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-6 py-20" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-center text-3xl font-bold tracking-tight">Questions</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-900">{f.q}<span className="text-xl text-brand-500 transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 pb-24">
          <CtaBanner title="Ready to put it all in one place?" text="Create your free space in seconds. No credit card." primary={{ href: "/signup", label: "Create my free space" }} />
        </div>
      </main>

      <footer className="border-t border-stone-200 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-stone-500">
          <LogoWordmark className="text-base" />
          <nav aria-label="Legal" className="flex flex-wrap gap-5">
            <Link href="/mentions-legales" hrefLang="fr" lang="fr" className="hover:text-stone-900">Legal notice (FR)</Link>
            <Link href="/confidentialite" hrefLang="fr" lang="fr" className="hover:text-stone-900">Privacy (FR)</Link>
            <Link href="/cgu" hrefLang="fr" lang="fr" className="hover:text-stone-900">Terms (FR)</Link>
            <Link href="/" hrefLang="fr" lang="fr" className="hover:text-stone-900">Français</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
