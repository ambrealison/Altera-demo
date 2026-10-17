import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Lang, Profile } from "./lib/types";
import { STRINGS, fill } from "./lib/i18n";
import { fmtNum } from "./lib/calc";
import { F } from "./lib/facts";
import { DOWNLOADS } from "./config";
import { COUNT } from "./data/movement";
import { MiniMap } from "./Movement";
import { Gloss } from "./Gloss";
import { REPORT_PAGES, REPORT_TITLES, ReportPages } from "./report/Report";

interface P { lang: Lang; onNext: () => void }
const Arrow = () => <span className="arr">→</span>;
const pctTxt = (v: number, lang: Lang, d = 1) => `${fmtNum(v * 100, lang, d)}${lang === "fr" ? " %" : "%"}`;

/** A number that eases towards its target, for figures that react to the visitor. */
function useTween(target: number, ms = 650) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now(), a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const x = a + (target - a) * e;
      setV(x);
      from.current = x;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

// ------------------------------------------------------------ cover: who is watching
export function Cover({ lang, onStart, onQuick }: { lang: Lang; onStart: (p: Profile) => void; onQuick: () => void }) {
  const T = STRINGS[lang].cover;
  return (
    <section className="slide cover">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display xl rise d1">{T.title}</h1>
      <p className="lead rise d2">{T.lead}</p>
      <div className="who rise d3">
        <span className="who-label">{T.who}</span>
        <div className="actions">
          <button className="pill pill-dark" onClick={() => onStart("retailer")} autoFocus>{T.retailer} <Arrow /></button>
          <button className="pill pill-ghost" onClick={() => onStart("ngo")}>{T.ngo} <Arrow /></button>
        </div>
        <div className="cover-meta">
          <span className="meta">{T.meta}</span>
          <button className="quicklink" onClick={onQuick}><span className="tri" aria-hidden />{T.quick}</button>
        </div>
      </div>
      <Peek lang={lang} />
    </section>
  );
}

/** A glimpse of the app window, as on the alterafood.org hero. */
function Peek({ lang }: { lang: Lang }) {
  const c = 2 * Math.PI * 34;
  const label = lang === "fr" ? "Part végétale des protéines" : "Plant share of protein";
  return (
    <div className="peek rise d4" aria-hidden>
      <div className="peek-frame">
        <div className="peek-win">
          <div className="peek-bar"><span className="wlogo">Altera<em>.ai</em></span><span className="crumb"><b>Harbour Market</b></span><span className="badge">Demo</span></div>
          <div className="peek-body">
            <div className="banner">
              <div>
                <div className="tagrow"><b>WWF</b><b>Protein Tracker</b></div>
                <div className="h">{label}</div>
                <div className="big">{fmtNum(F.ptRatio * 100, lang, 1)}<small>%</small></div>
              </div>
              <svg width="84" height="84" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(249,206,169,.9)" strokeWidth="9" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#bfe3c9" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * F.ptRatio} ${c}`} transform="rotate(-90 40 40)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ why now: the movement, in short
export function Why({ lang, profile, onNext }: P & { profile: Profile }) {
  const T = STRINGS[lang].why;
  const K = STRINGS[lang].end.kpis;
  const S = STRINGS[lang];
  return (
    <section className="slide">
      <div className="why-grid">
        <div>
          <p className="eyebrow rise">{T.eyebrow}</p>
          <h1 className="display lg rise d1">{T.title}</h1>
          <p className="lead rise d2">{T.lead[profile]}</p>
          <ol className="why-points rise d3">
            {T.points[profile].map(([h, d], i) => (
              <li key={h}><span className="wn">{i + 1}</span><div><b>{h}</b><span>{fill(d, { n: COUNT.publishes })}</span></div></li>
            ))}
          </ol>
          <div className="actions rise d4"><button className="pill pill-dark" onClick={onNext} autoFocus>{S.next} <Arrow /></button></div>
        </div>
        <figure className="why-map rise d2">
          <div className="mv-kpis">
            <div><b>{COUNT.publishes}</b><span>{K.publishes}</span></div>
            <div><b>{COUNT.measures}</b><span>{K.measures}</span></div>
            <div><b>{COUNT.countries}</b><span>{K.countries}</span></div>
          </div>
          <MiniMap label={T.title} />
          <figcaption>{T.mapNote}</figcaption>
        </figure>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ the ratio, with levers to try
type LeverId = "mince" | "milk" | "lentils";
type NameId = keyof (typeof STRINGS)["en"]["ratio"]["names"];
interface Item { id: string; name: NameId; mass: number; prot: number; plantF: number; fg: "FG1" | "FG2" | null; dairy: number; lever?: LeverId }
const LEVERS: LeverId[] = ["mince", "milk", "lentils"];

/** An illustrative basket, in kg of product sold; protein in g per 100 g. */
function basket(on: Set<LeverId>): Item[] {
  return [
    on.has("mince")
      ? { id: "beef", name: "mince", mass: 500, prot: 18, plantF: 1, fg: "FG1", dairy: 1, lever: "mince" }
      : { id: "beef", name: "beef", mass: 500, prot: 20, plantF: 0, fg: "FG1", dairy: 1 },
    on.has("milk")
      ? { id: "milk", name: "soya", mass: 2000, prot: 3.3, plantF: 1, fg: "FG2", dairy: 1, lever: "milk" }
      : { id: "milk", name: "milk", mass: 2000, prot: 3.4, plantF: 0, fg: "FG2", dairy: 1 },
    { id: "cheddar", name: "cheddar", mass: 240, prot: 25, plantF: 0, fg: "FG2", dairy: 10 },
    { id: "bread", name: "bread", mass: 500, prot: 9, plantF: 1, fg: null, dairy: 1 },
    { id: "lentils", name: "lentils", mass: on.has("lentils") ? 500 : 250, prot: 24, plantF: 1, fg: "FG1", dairy: 1, lever: on.has("lentils") ? "lentils" : undefined },
    { id: "pizza", name: "pizza", mass: 200, prot: 10, plantF: 0.5, fg: null, dairy: 1 },
  ];
}
function ratios(items: Item[]) {
  let pl = 0, pr = 0, wp = 0, wt = 0;
  for (const it of items) {
    const k = (it.mass * it.prot) / 100;
    pr += k; pl += k * it.plantF;
    if (it.fg) { const t = it.mass * it.dairy; wt += t; wp += t * it.plantF; }
  }
  return { pt: pl / pr, wwf: wp / wt };
}
const BASE = ratios(basket(new Set()));
const MAX_KG = 120;

export function Ratio({ lang, onNext, auto }: P & { auto: boolean }) {
  const T = STRINGS[lang].ratio;
  const S = STRINGS[lang];
  const [on, setOn] = useState<Set<LeverId>>(new Set());
  const items = basket(on);
  const r = ratios(items);
  const wwf = useTween(r.wwf), pt = useTween(r.pt);

  // while the demo plays by itself, try each lever in turn
  useEffect(() => {
    if (!auto) return;
    const plan: [number, LeverId[]][] = [[2200, ["mince"]], [5200, ["milk"]], [8200, ["lentils"]]];
    const ids = plan.map(([t, l]) => window.setTimeout(() => setOn(new Set(l)), t));
    return () => ids.forEach(clearTimeout);
  }, [auto]);

  const toggle = (l: LeverId) => setOn((s) => { const n = new Set(s); if (n.has(l)) n.delete(l); else n.add(l); return n; });
  const delta = (v: number, b: number) => {
    const d = (v - b) * 100;
    return Math.abs(d) < 0.05 ? null : `${d > 0 ? "+" : ""}${fmtNum(d, lang, 1)} pts`;
  };
  const dW = delta(r.wwf, BASE.wwf), dP = delta(r.pt, BASE.pt);

  return (
    <section className="slide">
      <div className="intro-grid">
        <div>
          <p className="eyebrow rise">{T.eyebrow}</p>
          <h1 className="display lg rise d1">{T.title}</h1>
          <p className="lead rise d2">{T.lead}</p>
          <div className="levers rise d3">
            <div className="levers-head"><b>{T.tryLever}</b>{on.size > 0 && <button className="reset" onClick={() => setOn(new Set())}>{T.reset}</button>}</div>
            <div className="lever-row">
              {LEVERS.map((l) => (
                <button key={l} className="lever" aria-pressed={on.has(l)} onClick={() => toggle(l)}>
                  <span className="lv-box" aria-hidden />{T.levers[l]}
                </button>
              ))}
            </div>
            <p className={`lesson ${on.size ? "on" : ""}`}>{on.size ? T.lesson : T.hint}</p>
          </div>
          <div className="actions rise d4"><button className="pill pill-dark" onClick={onNext} autoFocus>{S.next} <Arrow /></button></div>
        </div>
        <div className="basket rise d2">
          <div className="tiles">
            <div className="tile wwf">
              <span className="tl">{T.wwfTile}</span>
              <b>{pctTxt(wwf, lang)}</b>
              <span className="tn">{T.wwfNote}</span>
              <span className={`td ${dW ? "on" : ""}`}>{dW ?? " "}</span>
            </div>
            <div className="tile pt">
              <span className="tl">{T.ptTile}</span>
              <b>{pctTxt(pt, lang)}</b>
              <span className="tn">{T.ptNote}</span>
              <span className={`td ${dP ? "on" : ""}`}>{dP ?? " "}</span>
            </div>
          </div>
          <div className="basket-items">
            {items.map((it, i) => {
              const k = (it.mass * it.prot) / 100;
              return (
                <div className={`bitem rise ${it.lever ? "swapped" : ""}`} key={it.id} style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
                  <span className="bn">{T.names[it.name]}</span>
                  <span className="bbar">
                    <i style={{ width: `${(100 * k * it.plantF) / MAX_KG}%`, background: "var(--plant)" }} />
                    <i style={{ width: `${(100 * k * (1 - it.plantF)) / MAX_KG}%`, background: "var(--animal)" }} />
                  </span>
                  <span className="bk">{Math.round(k)}</span>
                </div>
              );
            })}
          </div>
          <div className="bfoot">
            <span className="legend" style={{ margin: 0 }}><span><i style={{ background: "var(--plant)" }} />{T.plant}</span><span><i style={{ background: "var(--animal)" }} />{T.animal}</span></span>
            <span className="fmeta">{T.kg}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ what you receive: the report, page by page
export function Receive({ lang, onNext }: P) {
  const T = STRINGS[lang].receive;
  const S = STRINGS[lang];
  const [open, setOpen] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const big = Math.max(0, (w - 16) * 0.675) / 794;
  const small = Math.max(0, (w - 16) * 0.325) / 794;
  const thumb = (n: number, s: number) => (
    <button className="rthumb" key={n} onClick={() => setOpen(n)} aria-label={fill(T.open, { n })}
      style={{ width: 794 * s, height: 1123 * s }}>
      <span className={`rscale show-${n}`} style={{ transform: `scale(${s})` }}><ReportPages lang={lang} /></span>
      <span className="rcap">{n} · {REPORT_TITLES[lang][n - 1]}</span>
    </button>
  );

  return (
    <section className="slide">
      <div className="intro-grid receive">
        <div>
          <p className="eyebrow rise">{T.eyebrow}</p>
          <h1 className="display lg rise d1">{T.title}</h1>
          <p className="lead rise d2">{T.lead}</p>
          <div className="dl rise d3">
            <a className="pill pill-lav" href={DOWNLOADS.report[lang]} download>{T.pdf} <span className="ext">PDF</span></a>
            <a className="pill pill-ghost" href={DOWNLOADS.workbook} download>{T.xlsx} <span className="ext">XLSX</span></a>
          </div>
          <div className="actions rise d4"><button className="pill pill-dark" onClick={onNext} autoFocus>{S.next} <Arrow /></button></div>
        </div>
        <div className="rthumbs rise d2" ref={boxRef}>
          {w > 0 && thumb(1, big)}
          {w > 0 && <div className="rstack">{thumb(2, small)}{thumb(3, small)}</div>}
        </div>
      </div>
      {open !== null && <Lightbox lang={lang} page={open} onPage={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Lightbox({ lang, page, onPage, onClose }: { lang: Lang; page: number; onPage: (n: number) => void; onClose: () => void }) {
  const T = STRINGS[lang].receive;
  const [s, setS] = useState(0.6);
  useLayoutEffect(() => {
    const fit = () => setS(Math.min((window.innerHeight - 110) / 1123, (window.innerWidth - 40) / 794, 1));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  useEffect(() => {
    // caught before the page-level arrow keys, so they turn report pages here
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onPage(Math.min(REPORT_PAGES, page + 1));
      else if (e.key === "ArrowLeft") onPage(Math.max(1, page - 1));
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", k, true);
    return () => window.removeEventListener("keydown", k, true);
  }, [page, onPage, onClose]);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={REPORT_TITLES[lang][page - 1]} onClick={onClose}>
      <div className="lb-bar" onClick={(e) => e.stopPropagation()}>
        <button className="lb-btn" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} aria-label={T.prev}>←</button>
        <span>{page} / {REPORT_PAGES} · {REPORT_TITLES[lang][page - 1]}</span>
        <button className="lb-btn" onClick={() => onPage(Math.min(REPORT_PAGES, page + 1))} disabled={page === REPORT_PAGES} aria-label={T.nextPage}>→</button>
        <button className="lb-btn close" onClick={onClose} autoFocus>{T.close}</button>
      </div>
      <div className="lb-stage" style={{ width: 794 * s, height: 1123 * s }} onClick={(e) => e.stopPropagation()}>
        <span className={`rscale show-${page}`} style={{ transform: `scale(${s})` }}><ReportPages lang={lang} /></span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ the two methodologies
export function Methods({ lang, onNext }: P) {
  const T = STRINGS[lang].methods;
  const rows = ["owner", "unit", "groups", "scope", "reports"] as const;
  return (
    <section className="slide">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display lg rise d1">{T.title}</h1>
      <p className="lead rise d2" style={{ maxWidth: "62ch" }}>{T.lead}</p>
      <div className="mtable rise d3">
        <div className="mhead" />
        <div className="mhead" style={{ background: "var(--peach)" }}><b>{T.wwf.name}</b></div>
        <div className="mhead" style={{ background: "var(--lav)" }}><b>{T.pt.name}</b></div>
        {rows.map((r) => (
          <div key={r} style={{ display: "contents" }}>
            <div className="mlabel">{T.rows[r]}</div>
            <div className={`mcell ${r === "unit" ? "strong" : ""}`}><Gloss text={T.wwf[r]} lang={lang} /></div>
            <div className={`mcell ${r === "unit" ? "strong" : ""}`}><Gloss text={T.pt[r]} lang={lang} /></div>
          </div>
        ))}
      </div>
      <div className="actions rise d4"><button className="pill pill-dark" onClick={onNext} autoFocus>{T.go} <Arrow /></button></div>
    </section>
  );
}
