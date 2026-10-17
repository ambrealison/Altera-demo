import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Profile } from "./lib/types";
import { STEPS, STRINGS, TIPS } from "./lib/i18n";
import { BOOKING_URL } from "./config";
import { STOPS } from "./tour";
import { Tour } from "./Frame";
import { Cover, Methods, Ratio, Receive, Why } from "./slides";
import { Movement } from "./Movement";

// The demo is one linear sequence: why it matters, what the ratio is, what you receive,
// the two methodologies, the guided tour, then the movement and the call to action.
// The quick path (one stop per step) is the 1-minute version, also used for the video.
type Path = "full" | "quick";
type SlideKind = "cover" | "why" | "ratio" | "receive" | "methods" | "end";
type Screen = { kind: SlideKind } | { kind: "tour"; i: number };

const QUICK = ["intake", "classes", "cascade", "origin", "wwf", "accuracy", "deliverables"];

function screensFor(path: Path): Screen[] {
  const intro: SlideKind[] = path === "quick" ? ["cover", "why", "ratio", "receive"] : ["cover", "why", "ratio", "receive", "methods"];
  const stops = path === "quick" ? QUICK.map((id) => STOPS.findIndex((s) => s.id === id)) : STOPS.map((_, i) => i);
  return [...intro.map((kind) => ({ kind })), ...stops.map((i) => ({ kind: "tour" as const, i })), { kind: "end" }];
}
const hashOf = (s: Screen) => (s.kind === "tour" ? STOPS[s.i].id : s.kind);

/** How long the demo stays on a screen when it plays by itself. */
function dwell(s: Screen, lang: Lang, speed: number): number {
  const fixed: Record<SlideKind, number> = { cover: 5000, why: 9000, ratio: 11500, receive: 9000, methods: 11000, end: Infinity };
  if (s.kind !== "tour") return fixed[s.kind] / speed;
  const tip = TIPS[lang][STOPS[s.i].id];
  const words = `${tip.t} ${tip.s}`.split(/\s+/).length;
  return Math.min(10000, Math.max(5500, 2400 + words * 230)) / speed;
}

const Q = new URLSearchParams(window.location.search);
const START = {
  // English by default; French only when the link asks for it (?lang=fr) or the visitor switches.
  lang: (Q.get("lang") === "fr" ? "fr" : "en") as Lang,
  profile: (Q.get("for") === "ngo" ? "ngo" : "retailer") as Profile,
  path: (Q.get("path") === "quick" ? "quick" : "full") as Path,
  // ?autoplay=1 for the website embed; ?speed=1.2 to shorten every dwell
  autoplay: Q.get("autoplay") === "1",
  speed: Math.min(3, Math.max(0.5, Number(Q.get("speed")) || 1)),
};

function indexFromHash(screens: Screen[]): number {
  const h = window.location.hash.replace("#", "");
  const i = screens.findIndex((s) => hashOf(s) === h);
  return i >= 0 ? i : 0;
}

export default function App() {
  const [lang, setLang] = useState<Lang>(START.lang);
  const [profile, setProfile] = useState<Profile>(START.profile);
  const [path, setPath] = useState<Path>(START.path);
  const screens = useMemo(() => screensFor(path), [path]);
  const [i, setI] = useState(() => indexFromHash(screensFor(START.path)));
  const [playing, setPlaying] = useState(START.autoplay);
  const hold = useRef(false);
  const screen = screens[Math.min(i, screens.length - 1)];
  const S = STRINGS[lang];

  const next = useCallback(() => setI((v) => Math.min(screens.length - 1, v + 1)), [screens.length]);
  const back = useCallback(() => setI((v) => Math.max(0, v - 1)), []);

  // shareable URL for every screen: ?lang=fr&for=ngo#classes
  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("lang", lang);
    if (profile === "ngo") u.searchParams.set("for", "ngo"); else u.searchParams.delete("for");
    if (path === "quick") u.searchParams.set("path", "quick"); else u.searchParams.delete("path");
    u.hash = hashOf(screen);
    window.history.replaceState(null, "", u.toString());
    document.documentElement.lang = lang;
    document.title = screen.kind === "tour"
      ? `Altera AI · ${STEPS[lang][STOPS[screen.i].chapter - 1]}`
      : `Altera AI · ${S.demo}`;
  }, [lang, profile, path, screen, S.demo]);

  useEffect(() => {
    const onHash = () => setI(indexFromHash(screens));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [screens]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [next, back]);

  // autoplay: advance after each screen's dwell, paused while the pointer rests on a tooltip.
  // Progress goes to a CSS variable so the Next button fills without re-rendering the page.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--play", "0");
    if (!playing) return;
    if (screen.kind === "end") { setPlaying(false); return; }
    const total = dwell(screen, lang, START.speed);
    let elapsed = 0, last = performance.now(), raf = 0;
    const tick = (now: number) => {
      if (!hold.current && !document.hidden) elapsed += now - last;
      last = now;
      root.style.setProperty("--play", String(Math.min(1, elapsed / total)));
      if (elapsed >= total) { next(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, screen, lang, next]);

  const start = (p: Profile) => { setProfile(p); next(); };
  const quick = () => { setPath("quick"); setI(1); setPlaying(true); };
  const jump = (chapter: number) => {
    const k = screens.findIndex((s) => s.kind === "tour" && STOPS[s.i].chapter === chapter);
    if (k >= 0) setI(k);
  };
  const restart = () => { setPath("full"); setI(0); setPlaying(false); };

  const tourScreens = screens.filter((s) => s.kind === "tour");
  const isTour = screen.kind === "tour";
  return (
    <div className={`page ${isTour ? "locked" : ""} ${playing ? "is-playing" : ""}`}>
      <header className="top">
        <div className="top-in">
          <button className="logo" onClick={restart} aria-label="Altera AI">
            <b>Altera</b><span>AI · {S.demo}</span>
          </button>
          <span className="spacer" />
          {screen.kind !== "end" && (
            <button className="playbtn" aria-pressed={playing} onClick={() => setPlaying((v) => !v)}>
              <span className={playing ? "ico-pause" : "ico-play"} aria-hidden />{playing ? S.pause : S.play}
            </button>
          )}
          <div className="lang" role="group" aria-label="Language">
            {(["en", "fr"] as Lang[]).map((l) => (
              <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
          <a className="pill pill-lav pill-sm" href={BOOKING_URL} target="_blank" rel="noopener">{S.cta}</a>
        </div>
        <div className="progress"><i style={{ width: `${(100 * i) / (screens.length - 1)}%` }} /></div>
      </header>

      {screen.kind === "cover" && <Cover key={`c-${lang}`} lang={lang} onStart={start} onQuick={quick} />}
      {screen.kind === "why" && <Why key={`w-${lang}-${profile}`} lang={lang} profile={profile} onNext={next} />}
      {screen.kind === "ratio" && <Ratio key={`r-${lang}-${playing}`} lang={lang} onNext={next} auto={playing} />}
      {screen.kind === "receive" && <Receive key={`v-${lang}`} lang={lang} onNext={next} />}
      {screen.kind === "methods" && <Methods key={`m-${lang}`} lang={lang} onNext={next} />}
      {screen.kind === "tour" && (
        <Tour index={screen.i} pos={tourScreens.indexOf(screen) + 1} count={tourScreens.length} lang={lang}
          playing={playing} onNext={next} onBack={back} onJump={jump}
          onHold={(h) => { hold.current = h; }} onStop={() => setPlaying(false)} />
      )}
      {screen.kind === "end" && <Movement key={`e-${lang}`} lang={lang} profile={profile} onRestart={restart} />}
    </div>
  );
}
