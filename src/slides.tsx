import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Lang } from "./lib/types";
import { STRINGS, fill } from "./lib/i18n";
import { fmtNum } from "./lib/calc";
import { F } from "./lib/facts";
import { DOWNLOADS } from "./config";
import { COUNT } from "./data/movement";
import { MiniMap } from "./Movement";
import { Gloss } from "./Gloss";
import { PAGE_H, PAGE_W, REPORT_PAGES, REPORT_TITLES, ReportPages } from "./report/Report";

interface P { lang: Lang; onNext: () => void }
const Arrow = () => <span className="arr">→</span>;

// ------------------------------------------------------------ cover
export function Cover({ lang, onNext }: P) {
  const T = STRINGS[lang].cover;
  return (
    <section className="slide cover">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display xl rise d1">{T.title}</h1>
      <p className="lead rise d2">{T.lead}</p>
      <div className="actions rise d3">
        <button className="pill pill-dark" onClick={onNext} autoFocus>{T.start} <Arrow /></button>
        <span className="meta">{T.meta}</span>
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
export function Why({ lang, onNext }: P) {
  const T = STRINGS[lang].why;
  const K = STRINGS[lang].end.kpis;
  const S = STRINGS[lang];
  return (
    <section className="slide">
      <div className="why-grid">
        <div>
          <p className="eyebrow rise">{T.eyebrow}</p>
          <h1 className="display lg rise d1">{T.title}</h1>
          <p className="lead rise d2">{T.lead}</p>
          <ol className="why-points rise d3">
            {T.points.map(([h, d], i) => (
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

  // the cover across the full width, two inside pages under it
  const big = w / PAGE_W;
  const small = Math.max(0, (w - 16) / 2) / PAGE_W;
  const thumb = (n: number, s: number) => (
    <button className="rthumb" key={n} onClick={() => setOpen(n)} aria-label={fill(T.open, { n })}
      style={{ width: PAGE_W * s, height: PAGE_H * s }}>
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
          {w > 0 && <div className="rstack">{thumb(3, small)}{thumb(6, small)}</div>}
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
    const fit = () => setS(Math.min((window.innerHeight - 110) / PAGE_H, (window.innerWidth - 40) / PAGE_W, 1));
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
      <div className="lb-stage" style={{ width: PAGE_W * s, height: PAGE_H * s }} onClick={(e) => e.stopPropagation()}>
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
