import { useCallback, useEffect, useState } from "react";
import type { Lang } from "./lib/types";
import { CHAPTERS, STRINGS } from "./lib/i18n";
import { BOOKING_URL } from "./config";
import { STOPS } from "./tour";
import { Tour } from "./Frame";
import { Cover, End, Intro } from "./slides";

// The whole demo is one linear sequence: cover, one intro slide, the guided tour, the close.
type Screen = { kind: "cover" | "intro" | "end" } | { kind: "tour"; i: number };
const SCREENS: Screen[] = [
  { kind: "cover" }, { kind: "intro" },
  ...STOPS.map((_, i) => ({ kind: "tour" as const, i })),
  { kind: "end" },
];
const hashOf = (s: Screen) => (s.kind === "tour" ? STOPS[s.i].id : s.kind);

function initialLang(): Lang {
  const q = new URLSearchParams(window.location.search).get("lang");
  if (q === "fr" || q === "en") return q;
  return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
}
function indexFromHash(): number {
  const h = window.location.hash.replace("#", "");
  const i = SCREENS.findIndex((s) => hashOf(s) === h);
  return i >= 0 ? i : 0;
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [i, setI] = useState(indexFromHash);
  const screen = SCREENS[i];
  const S = STRINGS[lang];

  const next = useCallback(() => setI((v) => Math.min(SCREENS.length - 1, v + 1)), []);
  const back = useCallback(() => setI((v) => Math.max(0, v - 1)), []);

  // shareable URL for every screen: ?lang=fr#classify
  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("lang", lang);
    u.hash = hashOf(screen);
    window.history.replaceState(null, "", u.toString());
    document.documentElement.lang = lang;
    document.title = screen.kind === "tour"
      ? `Altera AI — ${CHAPTERS[lang][STOPS[screen.i].chapter - 1]}`
      : `Altera AI — ${S.demo}`;
  }, [lang, screen, S.demo]);

  useEffect(() => {
    const onHash = () => setI(indexFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [next, back]);

  const isTour = screen.kind === "tour";
  return (
    <div className={`page ${isTour ? "locked" : ""}`}>
      <header className="top">
        <div className="top-in">
          <button className="logo" onClick={() => setI(0)} aria-label="Altera AI">
            <b>Altera</b><span>AI · {S.demo}</span>
          </button>
          <span className="spacer" />
          <div className="lang" role="group" aria-label="Language">
            {(["fr", "en"] as Lang[]).map((l) => (
              <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
          <a className="pill pill-lav pill-sm" href={BOOKING_URL} target="_blank" rel="noopener">{S.cta}</a>
        </div>
        <div className="progress"><i style={{ width: `${(100 * i) / (SCREENS.length - 1)}%` }} /></div>
      </header>

      {screen.kind === "cover" && <Cover key={`c-${lang}`} lang={lang} onNext={next} />}
      {screen.kind === "intro" && <Intro key={`i-${lang}`} lang={lang} onNext={next} />}
      {screen.kind === "tour" && <Tour index={screen.i} lang={lang} onNext={next} onBack={back} />}
      {screen.kind === "end" && <End key={`e-${lang}`} lang={lang} onRestart={() => setI(0)} />}
    </div>
  );
}
