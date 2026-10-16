import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { Ctx, type ScreenProps } from "./lib/ctx";
import { STRINGS } from "./lib/i18n";
import type { Lang, Multipliers, Product } from "./lib/types";
import { BOOKING_URL } from "./config";
import { inScope } from "./lib/calc";
import { Drawer } from "./components/Drawer";
import IntroRatio from "./screens/IntroRatio";
import IntroMethods from "./screens/IntroMethods";
import IntroWhy from "./screens/IntroWhy";
import Brief from "./screens/Brief";
import S1 from "./screens/S1Inventory";
import S2 from "./screens/S2Scope";
import S3 from "./screens/S3Classify";
import S4 from "./screens/S4Protein";
import S5 from "./screens/S5Split";
import S6 from "./screens/S6Volumes";
import S7 from "./screens/S7Calculate";
import S8 from "./screens/S8Checks";
import S9 from "./screens/S9Deliver";
import Finale from "./screens/Finale";

type Chapter = "intro" | "agent" | "end";
interface Screen { id: string; key: keyof typeof STRINGS.en.screens; chapter: Chapter; C: ComponentType<ScreenProps>; action?: (t: typeof STRINGS.en) => string }

const SCREENS: Screen[] = [
  { id: "ratio", key: "intro_ratio", chapter: "intro", C: IntroRatio },
  { id: "methods", key: "intro_methods", chapter: "intro", C: IntroMethods },
  { id: "why", key: "intro_why", chapter: "intro", C: IntroWhy },
  { id: "brief", key: "brief", chapter: "agent", C: Brief },
  { id: "inventory", key: "s1", chapter: "agent", C: S1, action: (t) => t.s1.action },
  { id: "scope", key: "s2", chapter: "agent", C: S2, action: (t) => t.s2.action },
  { id: "classify", key: "s3", chapter: "agent", C: S3, action: (t) => t.s3.action },
  { id: "protein", key: "s4", chapter: "agent", C: S4, action: (t) => t.s4.action },
  { id: "split", key: "s5", chapter: "agent", C: S5, action: (t) => t.s5.action },
  { id: "volumes", key: "s6", chapter: "agent", C: S6 },
  { id: "calculate", key: "s7", chapter: "agent", C: S7 },
  { id: "checks", key: "s8", chapter: "end", C: S8, action: (t) => t.s8.action },
  { id: "deliver", key: "s9", chapter: "end", C: S9 },
  { id: "finale", key: "finale", chapter: "end", C: Finale },
];

function initialLang(): Lang {
  const q = new URLSearchParams(window.location.search).get("lang");
  if (q === "fr" || q === "en") return q;
  return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
}
function initialStep(): number {
  const h = window.location.hash.replace("#", "");
  const i = SCREENS.findIndex((s) => s.id === h);
  return i >= 0 ? i : 0;
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [step, setStep] = useState<number>(initialStep);
  const [ran, setRan] = useState<Record<string, number>>({});
  const [m, setM] = useState<Multipliers>({});
  const [product, setProduct] = useState<Product | null>(null);
  const t = STRINGS[lang];
  const screen = SCREENS[step];
  const fill = (s: string) => s.replace("{n}", String(inScope.length));

  // keep the URL shareable: ?lang=fr#classify
  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("lang", lang);
    u.hash = screen.id;
    window.history.replaceState(null, "", u.toString());
    document.documentElement.lang = lang;
    document.title = `${t.brand} — ${t.screens[screen.key]}`;
  }, [lang, screen, t]);

  useEffect(() => {
    const onHash = () => setStep(initialStep());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

  const run = useCallback(() => {
    setRan((r) => ({ ...r, [screen.id]: (r[screen.id] ?? 0) + 1 }));
  }, [screen.id]);

  const pending = !!screen.action && !ran[screen.id];
  const next = useCallback(() => {
    if (pending) { run(); return; }
    setStep((s) => Math.min(SCREENS.length - 1, s + 1));
  }, [pending, run]);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (product) return;
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); back(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [next, back, product]);

  const ctx = useMemo(() => ({ lang, t, m, setM, open: setProduct }), [lang, t, m]);
  const chapters: Chapter[] = ["intro", "agent", "end"];
  const nextLabel = pending ? `▶ ${fill(screen.action!(t))}`
    : screen.id === "brief" ? t.brief.action
    : step === 0 ? t.nav.start
    : t.nav.next;
  const C = screen.C;

  return (
    <Ctx.Provider value={ctx}>
      <div className="app">
        <header className="top">
          <div className="top-in">
            <a className="brand" href="#ratio" onClick={(e) => { e.preventDefault(); setStep(0); }}>
              <img src="./brand/altera_logo_navy.png" alt="" />
              <span className="brand-name">{t.brand}</span>
              <span className="brand-tag">{t.tagline}</span>
            </a>
            <span className="top-spacer" />
            <div className="lang" role="group" aria-label="Language">
              {(["en", "fr"] as Lang[]).map((l) => (
                <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
              ))}
            </div>
            <a className="btn btn-primary btn-sm cta-top" href={BOOKING_URL} target="_blank" rel="noopener">{t.cta}</a>
          </div>
          <nav className="rail" aria-label="Steps">
            {chapters.map((c) => (
              <div key={c} className={`rail-group ${screen.chapter === c ? "active" : ""}`}>
                <span className="rail-title">{t.chapters[c]}</span>
                <div className="rail-steps">
                  {SCREENS.map((s, i) => s.chapter !== c ? null : (
                    <button key={s.id} className={`rail-step ${i === step ? "current" : i < step ? "done" : ""}`}
                      onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined} title={t.screens[s.key]}>
                      <span className="bar" />
                      <span className="lbl">{t.screens[s.key]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </header>

        <main className="stage">
          <div className="screen" key={`${screen.id}-${lang}`}>
            <C ran={!!ran[screen.id]} run={run} take={ran[screen.id] ?? 0} />
          </div>
        </main>

        <footer className="foot">
          <div className="progress" style={{ width: `${(100 * step) / (SCREENS.length - 1)}%` }} />
          <div className="foot-in">
            <button className="btn btn-ghost" onClick={back} disabled={step === 0}>← {t.nav.back}</button>
            <span className="count">{String(step + 1).padStart(2, "0")} / {SCREENS.length}</span>
            <span className="fict"><b>{lang === "fr" ? "Démo" : "Demo"}</b>{t.fictitious}</span>
            <span className="top-spacer" />
            <span className="hint">{t.nav.hint}</span>
            {step < SCREENS.length - 1 ? (
              <button className={pending ? "btn btn-run" : "btn btn-primary"} onClick={next}>
                {nextLabel} {!pending && "→"}
              </button>
            ) : (
              <a className="btn btn-primary" href={BOOKING_URL} target="_blank" rel="noopener">{t.cta} →</a>
            )}
          </div>
        </footer>
        {product && <Drawer p={product} onClose={() => setProduct(null)} />}
      </div>
    </Ctx.Provider>
  );
}
